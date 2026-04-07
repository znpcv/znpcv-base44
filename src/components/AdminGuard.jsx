import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

/**
 * AdminGuard — wraps any admin-only page/component.
 * Renders nothing (no flash) until auth check completes.
 * Redirects to Home if user is not admin.
 */
export default function AdminGuard({ children }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    let cancelled = false;
    base44.auth.me()
      .then(user => {
        if (cancelled) return;
        if (user?.role === 'admin') {
          setStatus('allowed');
        } else {
          setStatus('denied');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('denied');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (status === 'denied') {
      navigate(createPageUrl('Home'), { replace: true });
    }
  }, [status, navigate]);

  if (status === 'checking') {
    // Render nothing — prevents admin UI flash
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'denied') return null;

  return <>{children}</>;
}