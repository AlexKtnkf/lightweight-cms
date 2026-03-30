import api from './client';
import type { Settings } from '../../domain/settings/types';

function getFilenameFromContentDisposition(header?: string, fallback = 'download.bin') {
  if (!header) {
    return fallback;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const quotedMatch = header.match(/filename="([^"]+)"/i);
  if (quotedMatch?.[1]) {
    return quotedMatch[1];
  }

  const bareMatch = header.match(/filename=([^;]+)/i);
  return bareMatch?.[1]?.trim() || fallback;
}

export const settingsApi = {
  get: (): Promise<Settings> => 
    api.get('/admin/settings').then(r => r.data),
  
  update: (data: Partial<Settings>): Promise<Settings> => 
    api.put('/admin/settings', data).then(r => r.data),

  regenerate: (): Promise<{ success: boolean; message: string }> =>
    api.post('/admin/regenerate').then(r => r.data),

  backup: (): Promise<{ blob: Blob; filename: string }> =>
    api.post('/admin/backup', undefined, { responseType: 'blob' }).then((response) => ({
      blob: response.data,
      filename: getFilenameFromContentDisposition(response.headers['content-disposition'], 'backup-seed.sql'),
    })),

  downloadMediaBackup: (): Promise<{ blob: Blob; filename: string }> =>
    api.get('/admin/backup/media', { responseType: 'blob' }).then((response) => ({
      blob: response.data,
      filename: getFilenameFromContentDisposition(response.headers['content-disposition'], 'uploaded-images.zip'),
    })),
};
