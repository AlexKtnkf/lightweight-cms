import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { pagesApi } from '../../shared/api/pages';
import { articlesApi } from '../../shared/api/articles';
import { settingsApi } from '../../shared/api/settings';

export function Dashboard() {
  const [regenerateMessage, setRegenerateMessage] = useState<string | null>(null);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: () => pagesApi.list(),
  });

  const { data: articles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesApi.list(),
  });

  const regenerateMutation = useMutation({
    mutationFn: () => settingsApi.regenerate(),
    onSuccess: (data) => {
      setRegenerateMessage(data.message);
      setRegenerateError(null);
      setTimeout(() => setRegenerateMessage(null), 5000);
    },
    onError: (error: any) => {
      setRegenerateError(error.message || 'Erreur lors de la régénération');
      setRegenerateMessage(null);
      setTimeout(() => setRegenerateError(null), 5000);
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pages</h2>
          <p className="text-3xl font-bold text-blue-600 mb-2">{pages?.length || 0}</p>
          <Link to="/pages" className="text-blue-600 hover:text-blue-800">
            Voir toutes les pages →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Articles</h2>
          <p className="text-3xl font-bold text-green-600 mb-2">{articles?.length || 0}</p>
          <Link to="/articles" className="text-green-600 hover:text-green-800">
            Voir tous les articles →
          </Link>
        </div>
      </div>

      {regenerateMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{regenerateMessage}</p>
        </div>
      )}

      {regenerateError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{regenerateError}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/pages/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Nouvelle page
          </Link>
          <Link
            to="/articles/new"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Nouvel article
          </Link>
          <Link
            to="/media"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Gérer les images
          </Link>
          <Link
            to="/settings"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Paramètres
          </Link>
          <button
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {regenerateMutation.isPending ? 'Régénération...' : 'Régénérer le site'}
          </button>
        </div>
      </div>
    </div>
  );
}
