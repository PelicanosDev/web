import { useState, useEffect } from 'react';
import { Music, Link2, Trash2, ExternalLink, RefreshCw, Play, X } from 'lucide-react';
import axios from '@/api/axios';

function AdminSpotifyPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/spotify/status');
      setStatus(res.data.data);
      if (res.data.data?.connected) fetchPlaylist();
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylist = async () => {
    setPlaylistLoading(true);
    try {
      const res = await axios.get('/spotify/playlist');
      setPlaylist(res.data.data);
    } catch {
      // ignore
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await axios.get('/spotify/auth-url');
      window.location.href = res.data.data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Error al obtener URL de autorización');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Desconectar Spotify? Los tokens serán eliminados del servidor.')) return;
    try {
      await axios.delete('/spotify/disconnect');
      setStatus({ connected: false });
      setPlaylist(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al desconectar');
    }
  };

  const handleRemoveTrack = async (uri) => {
    setRemoving(uri);
    try {
      await axios.delete('/spotify/tracks', { data: { uri } });
      setPlaylist(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t.uri !== uri),
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la canción');
    } finally {
      setRemoving(null);
    }
  };

  const formatDuration = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
          Integraciones
        </span>
        <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
          Spotify del Club
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Conecta la cuenta de Spotify del club para crear y gestionar la playlist compartida.
        </p>
      </div>

      {/* Connection Card */}
      <div className={`border-l-4 p-6 flex flex-col sm:flex-row sm:items-center gap-4 ${status?.connected ? 'bg-green-50 border-green-500' : 'bg-slate-50 border-slate-300'}`}>
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 ${status?.connected ? 'bg-green-500' : 'bg-slate-300'}`}>
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className={`font-bold uppercase tracking-widest text-sm ${status?.connected ? 'text-green-700' : 'text-slate-600'}`}>
              {status?.connected ? 'Conectado' : 'No conectado'}
            </p>
            {status?.connected ? (
              <p className="text-slate-600 text-sm">
                {status.playlistName} · Conectado el{' '}
                {new Date(status.connectedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            ) : (
              <p className="text-slate-500 text-sm">
                Conecta la cuenta de Spotify del club para activar la playlist compartida.
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {status?.connected ? (
            <>
              {status.playlistUrl && (
                <a
                  href={status.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-2 border-green-500 text-green-700 font-bold uppercase tracking-wide px-4 py-2 text-sm hover:bg-green-500 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir
                </a>
              )}
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-2 border-2 border-red-400 text-red-600 font-bold uppercase tracking-wide px-4 py-2 text-sm hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Desconectar
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center gap-2 bg-green-500 text-white font-bold uppercase tracking-wide px-5 py-2.5 text-sm hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-60"
            >
              {connecting ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Redirigiendo...</>
              ) : (
                <><Link2 className="w-4 h-4" />Conectar Spotify</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Setup Instructions */}
      {!status?.connected && (
        <div className="bg-white border border-slate-200 p-6">
          <h2 className="font-display font-black uppercase text-slate-900 text-lg mb-4">Instrucciones de configuración</h2>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <span>Agrega las variables <code className="bg-slate-100 px-1 py-0.5 text-xs">SPOTIFY_CLIENT_ID</code>, <code className="bg-slate-100 px-1 py-0.5 text-xs">SPOTIFY_CLIENT_SECRET</code> y <code className="bg-slate-100 px-1 py-0.5 text-xs">SPOTIFY_REDIRECT_URI</code> al archivo <code className="bg-slate-100 px-1 py-0.5 text-xs">backend/.env</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <span>En el <strong>Spotify Developer Dashboard</strong>, registra las URIs de redirección: <code className="bg-slate-100 px-1 py-0.5 text-xs">http://localhost:5173/spotify/callback</code> y <code className="bg-slate-100 px-1 py-0.5 text-xs">https://pelicanosvoleyclub.com/spotify/callback</code>.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
              <span>Haz clic en <strong>"Conectar Spotify"</strong> e inicia sesión con la cuenta del club. Se creará automáticamente la playlist compartida.</span>
            </li>
          </ol>
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 text-xs text-slate-500">
            <strong>SPOTIFY_REDIRECT_URI</strong> en el .env debe ser exactamente la misma que registraste en Spotify Developer Dashboard (ej: <code>http://localhost:5173/spotify/callback</code>).
          </div>
        </div>
      )}

      {/* Playlist Tracks */}
      {status?.connected && (
        <div className="bg-white border border-slate-100 shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-display font-black uppercase text-slate-900 text-lg">
                {playlist?.playlistName || 'Playlist del Club'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-widest">
                {playlist?.tracks?.length || 0} canciones
              </p>
            </div>
            <button
              onClick={fetchPlaylist}
              disabled={playlistLoading}
              className="p-2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${playlistLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {playlistLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : playlist?.tracks?.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">La playlist está vacía</p>
              <p className="text-slate-300 text-xs mt-1">Los miembros pueden agregar canciones desde su dashboard</p>
            </div>
          ) : (
            <ul>
              {(playlist?.tracks || []).map((track, i) => (
                <li
                  key={track.uri}
                  className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                >
                  <span className="w-5 text-right text-xs text-slate-400 font-bold flex-shrink-0">{i + 1}</span>
                  {track.imageUrl ? (
                    <img src={track.imageUrl} alt={track.album} className="w-10 h-10 object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Play className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{track.name}</p>
                    <p className="text-xs text-slate-400 truncate">{track.artist} · {track.album}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{formatDuration(track.durationMs)}</span>
                  <button
                    onClick={() => handleRemoveTrack(track.uri)}
                    disabled={removing === track.uri}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
                    title="Eliminar"
                  >
                    {removing === track.uri ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminSpotifyPage;
