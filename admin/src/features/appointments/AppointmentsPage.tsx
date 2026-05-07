import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { appointmentsApi } from '../../shared/api/appointments';
import { useAuth } from '../auth/AuthContext';

const weekdayLabels = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export default function AppointmentsPage() {
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<'services' | 'availability' | 'bookings'>('services');
  const [serviceDraft, setServiceDraft] = useState({ name: '', duration_min: 60, price: '' as string | number, active: true });
  const [slotDraft, setSlotDraft] = useState({ weekday: 1, start_time: '09:00', end_time: '17:00' });

  const { data: services = [] } = useQuery<any[]>({ queryKey: ['appointments-services'], queryFn: appointmentsApi.listServices });
  const { data: availability = [] } = useQuery<any[]>({ queryKey: ['appointments-availability'], queryFn: appointmentsApi.listAvailability });
  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['appointments-bookings'],
    queryFn: appointmentsApi.listBookings,
    enabled: tab === 'bookings'
  });

  const addService = useMutation({
    mutationFn: () => appointmentsApi.createService({
      ...serviceDraft,
      duration_min: Number(serviceDraft.duration_min) || 60,
      price: serviceDraft.price === '' ? null : Number(serviceDraft.price)
    }),
    onSuccess: () => {
      setServiceDraft({ name: '', duration_min: 60, price: '', active: true });
      qc.invalidateQueries({ queryKey: ['appointments-services'] });
    }
  });

  const deleteService = useMutation({
    mutationFn: (id: number) => appointmentsApi.deleteService(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments-services'] })
  });

  const addSlot = useMutation({
    mutationFn: () => appointmentsApi.createAvailability(slotDraft),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments-availability'] })
  });

  const deleteSlot = useMutation({
    mutationFn: (id: number) => appointmentsApi.deleteAvailability(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments-availability'] })
  });

  const updateBookingStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => appointmentsApi.updateBookingStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments-bookings'] })
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rendez-vous</h1>

      <div className="flex space-x-4 mb-6 border-b">
        {['services', 'availability', 'bookings'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'services' ? 'Services' : t === 'availability' ? 'Disponibilites' : 'Reservations'}
          </button>
        ))}
      </div>

      {tab === 'services' && (
        <div className="space-y-6">
          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              <h2 className="font-semibold">Nouveau service</h2>
              <div className="grid md:grid-cols-4 gap-3">
                <input className="border rounded px-3 py-2 text-sm" placeholder="Nom" value={serviceDraft.name} onChange={e => setServiceDraft({ ...serviceDraft, name: e.target.value })} />
                <input className="border rounded px-3 py-2 text-sm" type="number" min={15} step={15} placeholder="Duree" value={serviceDraft.duration_min} onChange={e => setServiceDraft({ ...serviceDraft, duration_min: Number(e.target.value) })} />
                <input className="border rounded px-3 py-2 text-sm" type="number" min={0} placeholder="Prix centimes" value={serviceDraft.price} onChange={e => setServiceDraft({ ...serviceDraft, price: e.target.value })} />
                <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm" onClick={() => addService.mutate()} disabled={addService.isPending || !serviceDraft.name}>Ajouter</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duree</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {services.map((s: any) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-sm">{s.name}</td>
                    <td className="px-4 py-3 text-sm">{s.duration_min} min</td>
                    <td className="px-4 py-3 text-sm">{s.price != null ? `${(s.price / 100).toFixed(2)} ${s.currency}` : '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <button className="text-red-600 text-sm" onClick={() => deleteService.mutate(s.id)}>Supprimer</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'availability' && (
        <div className="space-y-6">
          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Ajouter un creneau hebdo</h2>
              <div className="grid md:grid-cols-4 gap-3">
                <select className="border rounded px-3 py-2 text-sm" value={slotDraft.weekday} onChange={e => setSlotDraft({ ...slotDraft, weekday: Number(e.target.value) })}>
                  {weekdayLabels.map((label, idx) => <option key={idx} value={idx}>{label}</option>)}
                </select>
                <input className="border rounded px-3 py-2 text-sm" type="time" value={slotDraft.start_time} onChange={e => setSlotDraft({ ...slotDraft, start_time: e.target.value })} />
                <input className="border rounded px-3 py-2 text-sm" type="time" value={slotDraft.end_time} onChange={e => setSlotDraft({ ...slotDraft, end_time: e.target.value })} />
                <button className="bg-blue-600 text-white rounded px-4 py-2 text-sm" onClick={() => addSlot.mutate()}>Ajouter</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jour</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fin</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {availability.map((slot: any) => (
                  <tr key={slot.id}>
                    <td className="px-4 py-3 text-sm">{weekdayLabels[slot.weekday] || slot.weekday}</td>
                    <td className="px-4 py-3 text-sm">{slot.start_time}</td>
                    <td className="px-4 py-3 text-sm">{slot.end_time}</td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin && (
                        <button className="text-red-600 text-sm" onClick={() => deleteSlot.mutate(slot.id)}>Supprimer</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Debut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((b: any) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-sm">{b.customer_name}<br /><span className="text-xs text-gray-500">{b.customer_email}</span></td>
                  <td className="px-4 py-3 text-sm">{b.service_name || '—'}</td>
                  <td className="px-4 py-3 text-sm">{new Date(b.start_at).toLocaleString('fr-FR')}</td>
                  <td className="px-4 py-3 text-sm">
                    {isAdmin ? (
                      <select value={b.status} onChange={e => updateBookingStatus.mutate({ id: b.id, status: e.target.value })} className="text-xs border border-gray-300 rounded px-2 py-1">
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirme</option>
                        <option value="cancelled">Annule</option>
                        <option value="done">Effectue</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        b.status === 'done' ? 'bg-gray-100 text-gray-600' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.status === 'confirmed' ? 'Confirme' : b.status === 'cancelled' ? 'Annule' : b.status === 'done' ? 'Effectue' : 'En attente'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
