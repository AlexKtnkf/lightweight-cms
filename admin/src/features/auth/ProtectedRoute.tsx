import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../shared/api/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const hasCheckedRef = useRef(false);
  const isCheckingRef = useRef(false);
  const lastCheckedPathRef = useRef<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Skip auth check if we're on login page
    if (location.pathname === '/login' || location.pathname === '/admin/login') {
      console.log('[ProtectedRoute] On login page, skipping auth check');
      queueMicrotask(() => setIsAuthenticated(false));
      return;
    }

    // Only skip if we already have a definitive result for this path (avoids stuck loading
    // when the component unmounted before the first check completed, e.g. React Strict Mode)
    if (
      hasCheckedRef.current &&
      lastCheckedPathRef.current === location.pathname &&
      isAuthenticated !== null
    ) {
      console.log('[ProtectedRoute] Already checked for this path, skipping');
      return;
    }
    if (isCheckingRef.current) {
      console.log('[ProtectedRoute] Already checking, skipping');
      return;
    }
    
    lastCheckedPathRef.current = location.pathname;
    
    isCheckingRef.current = true;
    let isMounted = true;
    let requestCompleted = false;
    
    console.log('[ProtectedRoute] Starting auth check...');
    
    // Fallback timeout - if request takes more than 3 seconds, assume failure
    const fallbackTimeout = setTimeout(() => {
      if (!requestCompleted && isMounted) {
        console.error('[ProtectedRoute] Auth check TIMEOUT - request took too long');
        hasCheckedRef.current = true;
        isCheckingRef.current = false;
        setIsAuthenticated(false);
      }
    }, 3000);
    
    // Make request immediately (no delay needed)
    console.log('[ProtectedRoute] Making API call to /admin/settings...');
    const fullUrl = '/api/admin/settings';
    console.log('[ProtectedRoute] Full URL will be:', fullUrl);
    console.log('[ProtectedRoute] Axios baseURL:', api.defaults.baseURL);
    console.log('[ProtectedRoute] Making request now...');
    
    const requestPromise = api.get('/admin/settings', {
      headers: { 'Accept': 'application/json' },
      timeout: 2000, // 2 second timeout - fail fast
    });
    
    console.log('[ProtectedRoute] Request promise created:', requestPromise);
    
    requestPromise
      .then((response) => {
        requestCompleted = true;
        clearTimeout(fallbackTimeout);
        console.log('[ProtectedRoute] Auth check SUCCESS:', response.status, response.data);
        hasCheckedRef.current = true;
        isCheckingRef.current = false;
        setIsAuthenticated(true);
      })
      .catch((error) => {
        requestCompleted = true;
        clearTimeout(fallbackTimeout);
        console.error('[ProtectedRoute] Auth check FAILED:', {
          status: error.response?.status,
          message: error.message,
        });
        hasCheckedRef.current = true;
        isCheckingRef.current = false;
        setIsAuthenticated(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [location.pathname, isAuthenticated]); // Re-run if pathname or auth result changes

  // Show loading while checking (but with a shorter timeout)
  if (isAuthenticated === null) {
    console.log('[ProtectedRoute] Still checking auth, showing loading...');
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #2563eb', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '16px', color: '#4b5563' }}>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login...');
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  console.log('[ProtectedRoute] Authenticated, rendering children');
  return <>{children}</>;
}
