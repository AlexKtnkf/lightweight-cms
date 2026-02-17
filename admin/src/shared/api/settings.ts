import api from './client';
import type { Settings } from '../../domain/settings/types';

export const settingsApi = {
  get: (): Promise<Settings> => 
    api.get('/admin/settings').then(r => r.data),
  
  update: (data: Partial<Settings>): Promise<Settings> => 
    api.put('/admin/settings', data).then(r => r.data),
};
