import api from './client';
import type { Settings } from '../../domain/settings/types';

export const settingsApi = {
  get: (): Promise<Settings> => 
    api.get('/admin/settings').then(r => r.data),
  
  update: (data: Partial<Settings>): Promise<Settings> => 
    api.put('/admin/settings', data).then(r => r.data),

  regenerate: (): Promise<{ success: boolean; message: string }> =>
    api.post('/admin/regenerate').then(r => r.data),

  backup: (): Promise<{ success: boolean; message: string; filename: string; path: string }> =>
    api.post('/admin/backup').then(r => r.data),
};
