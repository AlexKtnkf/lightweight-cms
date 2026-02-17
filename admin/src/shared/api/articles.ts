import api from './client';
import type { Article } from '../../domain/content/types';

export const articlesApi = {
  list: (): Promise<Article[]> => 
    api.get('/admin/articles').then(r => r.data),
  
  get: (id: number): Promise<Article> => 
    api.get(`/admin/articles/${id}`).then(r => r.data),
  
  create: (data: Partial<Article>): Promise<Article> => 
    api.post('/admin/articles', data).then(r => r.data),
  
  update: (id: number, data: Partial<Article>): Promise<Article> => 
    api.put(`/admin/articles/${id}`, data).then(r => r.data),
  
  delete: (id: number): Promise<void> => 
    api.delete(`/admin/articles/${id}`).then(() => undefined),
};
