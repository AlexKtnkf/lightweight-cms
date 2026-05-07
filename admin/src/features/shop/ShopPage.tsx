import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { shopApi } from '../../shared/api/shop';
import { useAuth } from '../auth/AuthContext';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  stock: number | null;
  active: boolean;
  stripe_price_id: string | null;
}

const empty: Omit<Product, 'id' | 'slug'> = {
  name: '', description: '', price: 0, currency: 'EUR', stock: null, active: true, stripe_price_id: null
};

export default function ShopPage() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [tab, setTab] = useState<'products' | 'orders'>('products');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['shop-products'],
    queryFn: () => shopApi.listProducts()
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ['shop-orders'],
    queryFn: () => shopApi.listOrders(),
    enabled: tab === 'orders'
  });

  const saveMutation = useMutation({
    mutationFn: (product: Partial<Product>) =>
      product.id
        ? shopApi.updateProduct(product.id, product)
        : shopApi.createProduct(product),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shop-products'] }); setEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => shopApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-products'] })
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      shopApi.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shop-orders'] })
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    saveMutation.mutate({
      ...editing,
      price: Number(editing.price)
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Boutique</h1>
        {isAdmin && tab === 'products' && (
          <button
            onClick={() => setEditing({ ...empty })}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Nouveau produit
          </button>
        )}
      </div>

      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setTab('products')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 -mb-px ${tab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Produits
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`pb-2 px-1 text-sm font-medium border-b-2 -mb-px ${tab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Commandes
        </button>
      </div>

      {tab === 'products' && (
        <>
          {editing && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-lg font-semibold">{editing.id ? 'Modifier le produit' : 'Nouveau produit'}</h2>
                  <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      required
                      value={editing.name || ''}
                      onChange={e => setEditing({ ...editing, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editing.description || ''}
                      onChange={e => setEditing({ ...editing, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (centimes) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={editing.price ?? 0}
                        onChange={e => setEditing({ ...editing, price: Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editing.price ? <p className="text-xs text-gray-500 mt-1">= {(Number(editing.price) / 100).toFixed(2)} {editing.currency || 'EUR'}</p> : null}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock (vide = illimité)</label>
                      <input
                        type="number"
                        min={0}
                        value={editing.stock ?? ''}
                        onChange={e => setEditing({ ...editing, stock: e.target.value === '' ? null : Number(e.target.value) })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="illimité"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={editing.active !== false}
                      onChange={e => setEditing({ ...editing, active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="active" className="text-sm text-gray-700">Produit actif (visible en boutique)</label>
                  </div>
                  {saveMutation.isError && (
                    <p className="text-sm text-red-600">Erreur lors de la sauvegarde.</p>
                  )}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
                    <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                      {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-500">Aucun produit. Créez-en un pour commencer.</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{(p.price / 100).toFixed(2)} {p.currency}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.stock ?? '∞'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {p.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {isAdmin && (
                          <>
                            <button onClick={() => setEditing(p)} className="text-sm text-blue-600 hover:text-blue-800">Modifier</button>
                            <button
                              onClick={() => { if (confirm('Supprimer ce produit ?')) deleteMutation.mutate(p.id); }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {orders.length === 0 ? (
            <p className="p-6 text-gray-500">Aucune commande.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((o: any) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">#{o.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{o.customer_email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(o.total_amount / 100).toFixed(2)} {o.currency}</td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <select
                          value={o.status}
                          onChange={e => statusMutation.mutate({ id: o.id, status: e.target.value })}
                          className="text-xs border border-gray-300 rounded px-1 py-0.5"
                        >
                          <option value="pending">En attente</option>
                          <option value="paid">Payée</option>
                          <option value="cancelled">Annulée</option>
                          <option value="refunded">Remboursée</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${
                          o.status === 'paid' ? 'bg-green-100 text-green-700' :
                          o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          o.status === 'refunded' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {o.status === 'paid' ? 'Payée' : o.status === 'cancelled' ? 'Annulée' : o.status === 'refunded' ? 'Remboursée' : 'En attente'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(o.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 text-right text-xs">
                      {o.stripe_session_id ? o.stripe_session_id.slice(0, 16) + '…' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
