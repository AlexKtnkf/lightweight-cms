import api from './client';

export interface ShopProductPayload {
  name?: string;
  description?: string | null;
  price?: number;
  currency?: string;
  image_media_id?: number | null;
  stock?: number | null;
  active?: boolean;
  stripe_price_id?: string | null;
}

export const shopApi = {
  listProducts: () => api.get('/admin/shop/products').then(r => r.data),
  createProduct: (data: ShopProductPayload) => api.post('/admin/shop/products', data).then(r => r.data),
  updateProduct: (id: number, data: ShopProductPayload) => api.put(`/admin/shop/products/${id}`, data).then(r => r.data),
  deleteProduct: (id: number) => api.delete(`/admin/shop/products/${id}`).then(() => undefined),

  listOrders: () => api.get('/admin/shop/orders').then(r => r.data),
  updateOrderStatus: (id: number, status: string) =>
    api.patch(`/admin/shop/orders/${id}/status`, { status }).then(r => r.data),
};
