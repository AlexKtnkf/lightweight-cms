import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pagesApi } from '../../shared/api/pages';
import { articlesApi } from '../../shared/api/articles';

export function Dashboard() {
  const { data: pages } = useQuery({
    queryKey: ['pages'],
    queryFn: () => pagesApi.list(),
  });

  const { data: articles } = useQuery({
    queryKey: ['articles'],
    queryFn: () => articlesApi.list(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pages</h2>
          <p className="text-3xl font-bold text-blue-600 mb-2">{pages?.length || 0}</p>
          <Link to="/admin/pages" className="text-blue-600 hover:text-blue-800">
            View all pages →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Articles</h2>
          <p className="text-3xl font-bold text-green-600 mb-2">{articles?.length || 0}</p>
          <Link to="/admin/articles" className="text-green-600 hover:text-green-800">
            View all articles →
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/admin/pages/new"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Page
          </Link>
          <Link
            to="/admin/articles/new"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            New Article
          </Link>
          <Link
            to="/admin/media"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Manage Media
          </Link>
          <Link
            to="/admin/settings"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
