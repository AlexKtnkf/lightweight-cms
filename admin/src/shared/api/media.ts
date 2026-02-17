import api from './client';
import type { Media } from '../../domain/media/types';

export const mediaApi = {
  list: (): Promise<Media[]> => 
    api.get('/admin/media').then(r => r.data),
  
  upload: (file: File): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    // Don't set Content-Type header - let browser set it with boundary
    return api.post('/admin/media/upload', formData).then(r => r.data);
  },
  
  delete: (id: number): Promise<void> => 
    api.delete(`/admin/media/${id}`).then(() => undefined),
};
