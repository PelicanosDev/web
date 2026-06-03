import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '@/api/axios';

function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Autenticación cancelada o denegada por Spotify.');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No se recibió el código de autorización.');
      return;
    }

    axios
      .post('/spotify/callback', { code })
      .then(() => {
        setStatus('success');
        setMessage('¡Spotify conectado exitosamente!');
        setTimeout(() => navigate('/admin/spotify'), 1500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Error al conectar Spotify.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 p-10 text-center max-w-sm w-full">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-slate-600 border-t-green-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-bold uppercase tracking-widest text-sm">Conectando Spotify...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <span className="text-5xl block mb-4">✅</span>
            <p className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">Conectado</p>
            <p className="text-slate-300 text-sm">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <span className="text-5xl block mb-4">❌</span>
            <p className="text-red-400 font-bold uppercase tracking-widest text-sm mb-2">Error</p>
            <p className="text-slate-300 text-sm mb-4">{message}</p>
            <button
              onClick={() => navigate('/admin/spotify')}
              className="bg-primary-500 text-white font-bold uppercase tracking-widest px-5 py-2 text-sm hover:bg-primary-600 transition-colors cursor-pointer"
            >
              Volver al panel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SpotifyCallback;
