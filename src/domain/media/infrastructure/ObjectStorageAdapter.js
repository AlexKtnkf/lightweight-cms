const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const logger = require('../../../../utils/logger');
const StorageAdapter = require('./StorageAdapter');

const MAX_WIDTH = 1920;
const THUMBNAIL_WIDTH = 300;
const PIN_WIDTH = 720;
const PIN_HEIGHT = 900;

/**
 * ObjectStorageAdapter — stores processed images in an S3-compatible bucket.
 *
 * Required env vars:
 *   S3_BUCKET        — bucket name
 *   S3_REGION        — AWS region (default: auto)
 *   S3_ACCESS_KEY_ID — access key
 *   S3_SECRET_ACCESS_KEY — secret key
 *   S3_ENDPOINT      — custom endpoint URL (Cloudflare R2, MinIO, DO Spaces, …)
 *   S3_PUBLIC_URL    — base public URL for serving files (e.g. https://cdn.example.com)
 *                      If omitted, defaults to https://<bucket>.s3.<region>.amazonaws.com
 */
class ObjectStorageAdapter extends StorageAdapter {
  constructor() {
    super();
    this.bucket = process.env.S3_BUCKET;
    this.region = process.env.S3_REGION || 'auto';
    this.publicBase = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '');

    const clientOptions = {
      region: this.region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      }
    };
    if (process.env.S3_ENDPOINT) {
      clientOptions.endpoint = process.env.S3_ENDPOINT;
      // Required for path-style access (MinIO, some providers)
      clientOptions.forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';
    }
    this.client = new S3Client(clientOptions);
  }

  _publicUrl(key) {
    if (this.publicBase) {
      return `${this.publicBase}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async _putObject(key, buffer, contentType) {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }));
  }

  async upload(file) {
    const baseKey = `uploads/images/${uuidv4()}`;
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const contentType = file.mimetype;

    // ── process original ────────────────────────────────────────────────────
    let processedBuf = file.buffer;
    const metadata = await sharp(file.buffer).metadata();
    let { width, height } = metadata;

    let pipeline = sharp(file.buffer);
    if (width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true, fit: 'inside' });
      const r = await pipeline.toBuffer({ resolveWithObject: true });
      processedBuf = r.data;
      width = r.info.width;
      height = r.info.height;
    }

    // ── generate variants ───────────────────────────────────────────────────
    const [thumbBuf, pinBuf, webpBuf, thumbWebpBuf] = await Promise.all([
      sharp(file.buffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
        .toBuffer(),
      sharp(file.buffer)
        .resize(PIN_WIDTH, PIN_HEIGHT, { fit: 'cover', position: 'centre', withoutEnlargement: false })
        .toBuffer(),
      sharp(processedBuf).webp({ quality: 85 }).toBuffer(),
      sharp(file.buffer)
        .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 85 })
        .toBuffer()
    ]);

    // ── upload all variants ──────────────────────────────────────────────────
    const originalKey   = `${baseKey}${ext}`;
    const thumbKey      = `${baseKey}_thumb${ext}`;
    const pinKey        = `${baseKey}_pin${ext}`;
    const webpKey       = `${baseKey}.webp`;
    const thumbWebpKey  = `${baseKey}_thumb.webp`;

    await Promise.all([
      this._putObject(originalKey,  processedBuf, contentType),
      this._putObject(thumbKey,     thumbBuf,     contentType),
      this._putObject(pinKey,       pinBuf,       contentType),
      this._putObject(webpKey,      webpBuf,      'image/webp'),
      this._putObject(thumbWebpKey, thumbWebpBuf, 'image/webp')
    ]);

    const src = this._publicUrl(originalKey);
    logger.info(`Uploaded image to object storage: ${src}`);

    return {
      originalPath:    `/${originalKey}`,
      thumbnailPath:   `/${thumbKey}`,
      webpPath:        `/${webpKey}`,
      thumbnailWebpPath: `/${thumbWebpKey}`,
      width,
      height,
      fileSize: file.size,
      src                   // full public URL stored in DB
    };
  }

  async delete(media) {
    // media.path is the canonical path; derive the other variant keys from it
    const originalKey = media.path.replace(/^\//, '');
    const ext = path.extname(originalKey);
    const baseKey = ext ? originalKey.slice(0, -ext.length) : originalKey;

    const keys = [
      originalKey,
      `${baseKey}_thumb${ext}`,
      `${baseKey}_pin${ext}`,
      `${baseKey}.webp`,
      `${baseKey}_thumb.webp`
    ];

    await Promise.all(
      keys.map(key =>
        this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
          .catch(err => logger.warn(`Could not delete object ${key}: ${err.message}`))
      )
    );
  }
}

module.exports = ObjectStorageAdapter;
