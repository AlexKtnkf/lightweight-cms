import api from './client';

export const appointmentsApi = {
  listServices: () => api.get('/admin/appointments/services').then(r => r.data),
  createService: (data: Record<string, any>) => api.post('/admin/appointments/services', data).then(r => r.data),
  updateService: (id: number, data: Record<string, any>) => api.put(`/admin/appointments/services/${id}`, data).then(r => r.data),
  deleteService: (id: number) => api.delete(`/admin/appointments/services/${id}`).then(() => undefined),

  listAvailability: () => api.get('/admin/appointments/availability').then(r => r.data),
  createAvailability: (data: Record<string, any>) => api.post('/admin/appointments/availability', data).then(r => r.data),
  deleteAvailability: (id: number) => api.delete(`/admin/appointments/availability/${id}`).then(() => undefined),

  listBookings: () => api.get('/admin/appointments/bookings').then(r => r.data),
  updateBookingStatus: (id: number, status: string) =>
    api.patch(`/admin/appointments/bookings/${id}/status`, { status }).then(r => r.data),
};
