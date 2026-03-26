import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { PagesList } from './features/pages/PagesList';
import { PageEditor } from './features/pages/PageEditor';
import { ArticlesList } from './features/articles/ArticlesList';
import { ArticleEditor } from './features/articles/ArticleEditor';
import { ImagesList } from './features/media/MediaList';
import { SettingsEditor } from './features/settings/SettingsEditor';
import { Dashboard } from './features/dashboard/Dashboard';
import { Login } from './features/auth/Login';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { InstagramSlideGenerator } from './features/instagram/InstagramSlideGenerator';

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
          <Route path="/*" element={
            <ProtectedRoute>
              <AdminApp />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function AdminApp() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center px-2 py-2 text-gray-900 font-semibold">
                OB Admin
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
                Tableau de bord
              </Link>
              <Link to="/pages" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
                Pages
              </Link>
              <Link to="/articles" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
                Articles
              </Link>
              <Link to="/media" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
                Images
              </Link>
              <Link to="/instagram-slides" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
                Insta studio
              </Link>
              <Link to="/settings" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
                Paramètres
              </Link>
              <a href="/admin/logout" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm">
                Déconnexion
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base"
              >
                Tableau de bord
              </Link>
              <Link
                to="/pages"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base"
              >
                Pages
              </Link>
              <Link
                to="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base"
              >
                Articles
              </Link>
              <Link
                to="/media"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base"
              >
                Images
              </Link>
              <Link
                to="/instagram-slides"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base"
              >
                Insta studio
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base"
              >
                Paramètres
              </Link>
              <a
                href="/admin/logout"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-base"
              >
                Déconnexion
              </a>
            </div>
          </div>
        )}
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
          <Route path="/media" element={<ImagesList />} />
          <Route path="/instagram-slides" element={<InstagramSlideGenerator />} />
          <Route path="/settings" element={<SettingsEditor />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
