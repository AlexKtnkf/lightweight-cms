import { useState } from 'react';
import axios from 'axios';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store logs in sessionStorage so they persist across redirects
    const log = (msg: string, data?: any) => {
      const logEntry = `[${new Date().toISOString()}] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`;
      console.log(logEntry);
      const existingLogs = sessionStorage.getItem('loginLogs') || '';
      sessionStorage.setItem('loginLogs', existingLogs + '\n' + logEntry);
    };
    
    setError('');
    setLoading(true);
    log('Login form submitted', { username });

    try {
      log('Sending login request...');
      const response = await axios.post('/admin/login', new URLSearchParams({
        username,
        password,
      }), {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      log('Login response received', { 
        status: response.status, 
        success: response.data.success,
        cookies: document.cookie 
      });
      
      if (response.data.success) {
        log('Login successful, redirecting in 500ms...');
        // Longer delay to ensure cookie is set and logs are visible
        setTimeout(() => {
          log('Redirecting now...');
          window.location.href = '/admin';
        }, 500);
        return; // Don't set loading to false
      }
    } catch (err: any) {
      log('Login error', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        cookies: document.cookie
      });
      
      // Handle rate limiting error
      if (err.response?.status === 429) {
        setError('Trop de tentatives de connexion. Veuillez attendre quelques minutes ou redémarrer le serveur en développement.');
      } else {
        setError(err.response?.data?.error || err.response?.data?.message || 'Nom d\'utilisateur ou mot de passe invalide');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion Admin
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Debug: Show logs from sessionStorage */}
          {typeof window !== 'undefined' && sessionStorage.getItem('loginLogs') && (
            <div className="mb-4 p-2 bg-gray-100 text-xs font-mono overflow-auto max-h-32">
              <strong>Logs:</strong>
              <pre>{sessionStorage.getItem('loginLogs')}</pre>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Connexion'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
