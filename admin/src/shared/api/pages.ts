import api from './client';
import type { Page } from '../../domain/content/types';

export const pagesApi = {
  list: (): Promise<Page[]> => 
    api.get('/admin/pages').then(r => r.data),
  
  get: (id: number): Promise<Page> => 
    api.get(`/admin/pages/${id}`).then(r => r.data),
  
  create: (data: Partial<Page>): Promise<Page> => 
    api.post('/admin/pages', data).then(r => r.data),
  
  update: (id: number, data: Partial<Page>): Promise<Page> => 
    api.put(`/admin/pages/${id}`, data).then(r => r.data),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/admin/pages/${id}`).then(() => undefined),
};
