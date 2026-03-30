const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const db = require('../src/infrastructure/database/database');
const logger = require('../utils/logger');

const UPLOADS_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, '../public/uploads');
const ZIP_UTF8_FLAG = 0x0800;

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    table[i] = crc >>> 0;
  }

  return table;
})();

function timestampForFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function crc32(buffer) {
  let crc = 0xFFFFFFFF;

  for (const byte of buffer) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function toDosDateTime(date) {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime())
    ? date
    : new Date();
  const year = Math.max(safeDate.getFullYear(), 1980);
  const dosDate = ((year - 1980) << 9)
    | ((safeDate.getMonth() + 1) << 5)
    | safeDate.getDate();
  const dosTime = (safeDate.getHours() << 11)
    | (safeDate.getMinutes() << 5)
    | Math.floor(safeDate.getSeconds() / 2);

  return {
    date: dosDate & 0xFFFF,
    time: dosTime & 0xFFFF,
  };
}

function sanitizeEntryName(filename, fallback) {
  const baseName = path.basename(filename || fallback || 'image');
  const safeName = baseName.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
  return safeName || fallback || 'image';
}

function resolveMediaFilePath(mediaPath) {
  const relativePath = String(mediaPath || '').replace(/^\/+/, '');
  return path.join(UPLOADS_ROOT, relativePath.replace(/^uploads[\\/]/, ''));
}

async function listMediaFiles() {
  const mediaRows = await db.all(`
    SELECT id, filename, original_filename, path, uploaded_at
    FROM media
    ORDER BY uploaded_at ASC, id ASC
  `);

  const entries = [];

  for (const media of mediaRows) {
    const absolutePath = resolveMediaFilePath(media.path);

    try {
      const stats = await fsPromises.stat(absolutePath);
      if (!stats.isFile()) {
        continue;
      }

      const displayName = sanitizeEntryName(
        media.original_filename,
        media.filename || `image-${media.id}`
      );

      entries.push({
        id: media.id,
        absolutePath,
        zipPath: path.posix.join('uploaded-images', `${String(media.id).padStart(4, '0')}-${displayName}`),
        mtime: stats.mtime,
      });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        logger.warn(`Unable to include media ${media.id} in backup: ${error.message}`);
      }
    }
  }

  return entries;
}

function createLocalHeader(fileNameBuffer, metadata) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(ZIP_UTF8_FLAG, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(metadata.time, 10);
  header.writeUInt16LE(metadata.date, 12);
  header.writeUInt32LE(metadata.crc32, 14);
  header.writeUInt32LE(metadata.size, 18);
  header.writeUInt32LE(metadata.size, 22);
  header.writeUInt16LE(fileNameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function createCentralDirectoryHeader(fileNameBuffer, metadata) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(ZIP_UTF8_FLAG, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(metadata.time, 12);
  header.writeUInt16LE(metadata.date, 14);
  header.writeUInt32LE(metadata.crc32, 16);
  header.writeUInt32LE(metadata.size, 20);
  header.writeUInt32LE(metadata.size, 24);
  header.writeUInt16LE(fileNameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(metadata.offset, 42);
  return header;
}

function createEndOfCentralDirectory(entryCount, centralDirectorySize, centralDirectoryOffset) {
  const footer = Buffer.alloc(22);
  footer.writeUInt32LE(0x06054b50, 0);
  footer.writeUInt16LE(0, 4);
  footer.writeUInt16LE(0, 6);
  footer.writeUInt16LE(entryCount, 8);
  footer.writeUInt16LE(entryCount, 10);
  footer.writeUInt32LE(centralDirectorySize, 12);
  footer.writeUInt32LE(centralDirectoryOffset, 16);
  footer.writeUInt16LE(0, 20);
  return footer;
}

async function createZipArchive(files, outputPath) {
  const handle = await fsPromises.open(outputPath, 'w');
  const centralDirectory = [];
  let offset = 0;

  try {
    for (const file of files) {
      const data = await fsPromises.readFile(file.absolutePath);
      const fileNameBuffer = Buffer.from(file.zipPath, 'utf8');
      const { date, time } = toDosDateTime(file.mtime);
      const metadata = {
        date,
        time,
        crc32: crc32(data),
        size: data.length,
        offset,
      };

      const localHeader = createLocalHeader(fileNameBuffer, metadata);
      await handle.write(localHeader, 0, localHeader.length, offset);
      offset += localHeader.length;
      await handle.write(fileNameBuffer, 0, fileNameBuffer.length, offset);
      offset += fileNameBuffer.length;
      await handle.write(data, 0, data.length, offset);
      offset += data.length;

      centralDirectory.push({ fileNameBuffer, metadata });
    }

    const centralDirectoryOffset = offset;

    for (const entry of centralDirectory) {
      const header = createCentralDirectoryHeader(entry.fileNameBuffer, entry.metadata);
      await handle.write(header, 0, header.length, offset);
      offset += header.length;
      await handle.write(entry.fileNameBuffer, 0, entry.fileNameBuffer.length, offset);
      offset += entry.fileNameBuffer.length;
    }

    const centralDirectorySize = offset - centralDirectoryOffset;
    const footer = createEndOfCentralDirectory(
      centralDirectory.length,
      centralDirectorySize,
      centralDirectoryOffset
    );
    await handle.write(footer, 0, footer.length, offset);
  } finally {
    await handle.close();
  }
}

async function createMediaBackup() {
  const backupDir = path.join(__dirname, 'backups');
  fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = timestampForFilename();
  const filename = `${timestamp}-uploaded-images.zip`;
  const outputPath = path.join(backupDir, filename);
  const files = await listMediaFiles();

  await createZipArchive(files, outputPath);

  logger.info(`✓ Media backup zip written to ${outputPath} (${files.length} file(s))`);

  return {
    filename,
    path: outputPath,
    count: files.length,
  };
}

async function run() {
  try {
    await createMediaBackup();
  } catch (error) {
    logger.error('Media backup failed:', error);
    process.exitCode = 1;
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  createMediaBackup,
};
