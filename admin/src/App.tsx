import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { PagesList } from './features/pages/PagesList';
import { PageEditor } from './features/pages/PageEditor';
import { ArticlesList } from './features/articles/ArticlesList';
import { ArticleEditor } from './features/articles/ArticleEditor';
import { MediaList } from './features/media/MediaList';
import { SettingsEditor } from './features/settings/SettingsEditor';
import { Dashboard } from './features/dashboard/Dashboard';
import { Login } from './features/auth/Login';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AdminApp />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AdminApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link to="/" className="flex items-center px-2 py-2 text-gray-900 font-semibold">
                    Admin Panel
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                    Dashboard
                  </Link>
                  <Link to="/pages" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                    Pages
                  </Link>
                  <Link to="/articles" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                    Articles
                  </Link>
                  <Link to="/media" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                    Media
                  </Link>
                  <Link to="/settings" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                    Settings
                  </Link>
                  <a href="/admin/logout" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pages" element={<PagesList />} />
              <Route path="/pages/new" element={<PageEditor />} />
              <Route path="/pages/:id" element={<PageEditor />} />
              <Route path="/articles" element={<ArticlesList />} />
              <Route path="/articles/new" element={<ArticleEditor />} />
              <Route path="/articles/:id" element={<ArticleEditor />} />
              <Route path="/media" element={<MediaList />} />
              <Route path="/settings" element={<SettingsEditor />} />
            </Routes>
          </main>
        </div>
  );
}

export default App;
