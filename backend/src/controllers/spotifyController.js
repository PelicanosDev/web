const axios = require('axios');
const SpotifyConfig = require('../models/SpotifyConfig');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const SCOPES = 'playlist-modify-public playlist-modify-private playlist-read-private';

// ── helpers ──────────────────────────────────────────────────────────────────

const basicAuth = () =>
  Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const getValidToken = async () => {
  const config = await SpotifyConfig.findOne();
  if (!config || !config.refreshToken) throw new Error('Spotify no conectado');

  if (config.tokenExpiresAt && config.tokenExpiresAt > new Date()) {
    return config.accessToken;
  }

  // Refresh expired token
  const { data } = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: config.refreshToken }),
    { headers: { Authorization: `Basic ${basicAuth()}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  config.accessToken = data.access_token;
  config.tokenExpiresAt = new Date(Date.now() + data.expires_in * 1000);
  await config.save();
  return config.accessToken;
};

// ── controllers ───────────────────────────────────────────────────────────────

const getAuthUrl = (req, res) => {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return res.status(500).json({ success: false, message: 'Spotify no configurado en el servidor' });
  }
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'true',
  });
  res.json({ success: true, data: { url: `https://accounts.spotify.com/authorize?${params}` } });
};

const handleCallback = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Código no proporcionado' });

    // Exchange code for tokens
    const { data: tokenData } = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
      { headers: { Authorization: `Basic ${basicAuth()}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenData.access_token;
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    // Check if we already have a playlist saved
    let config = await SpotifyConfig.findOne();
    let playlistId = config?.playlistId;
    let playlistName = config?.playlistName;
    let playlistUrl = config?.playlistUrl;
    let playlistImageUrl = config?.playlistImageUrl;

    if (!playlistId) {
      // Create the playlist using /me/playlists (no user ID needed)
      const { data: playlist } = await axios.post(
        'https://api.spotify.com/v1/me/playlists',
        {
          name: 'Pelicanos Voley Club',
          description: 'La playlist oficial del Club Pelicanos. Agrega tus canciones favoritas!',
          public: true,
        },
        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
      );
      playlistId = playlist.id;
      playlistName = playlist.name;
      playlistUrl = playlist.external_urls?.spotify;
      playlistImageUrl = playlist.images?.[0]?.url || null;
    }

    // Save / update config
    await SpotifyConfig.findOneAndUpdate(
      {},
      {
        accessToken,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: expiresAt,
        playlistId,
        playlistName,
        playlistUrl,
        playlistImageUrl,
        connectedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Spotify conectado exitosamente', data: { playlistId, playlistName, playlistUrl } });
  } catch (error) {
    const spotifyError = error.response?.data;
    console.error('Spotify callback error:', JSON.stringify(spotifyError) || error.message);
    // Surface the actual Spotify error to the client for debugging
    const errObj = spotifyError?.error;
    const message =
      spotifyError?.error_description ||
      (typeof errObj === 'string' ? errObj : errObj?.message) ||
      error.message;
    return res.status(500).json({ success: false, message: `Spotify error: ${message}` });
  }
};

const getStatus = async (req, res, next) => {
  try {
    const config = await SpotifyConfig.findOne().select('-accessToken -refreshToken');
    if (!config || !config.playlistId) {
      return res.json({ success: true, data: { connected: false } });
    }

    // Try to refresh playlist image
    try {
      const token = await getValidToken();
      const { data: playlist } = await axios.get(
        `https://api.spotify.com/v1/playlists/${config.playlistId}?fields=images,external_urls,name`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (playlist.images?.[0]?.url && playlist.images[0].url !== config.playlistImageUrl) {
        config.playlistImageUrl = playlist.images[0].url;
        await config.save();
      }
    } catch (_) { /* ignore */ }

    res.json({
      success: true,
      data: {
        connected: true,
        playlistId: config.playlistId,
        playlistName: config.playlistName,
        playlistUrl: config.playlistUrl,
        playlistImageUrl: config.playlistImageUrl,
        connectedAt: config.connectedAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

const disconnect = async (req, res, next) => {
  try {
    await SpotifyConfig.deleteMany({});
    res.json({ success: true, message: 'Spotify desconectado' });
  } catch (error) {
    next(error);
  }
};

const searchTracks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ success: false, message: 'Query requerido' });

    const token = await getValidToken();
    const { data } = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: q.trim(), type: 'track', limit: 10, market: 'CO' },
      headers: { Authorization: `Bearer ${token}` }
    });

    const tracks = (data.tracks?.items || []).map(t => ({
      id: t.id,
      uri: t.uri,
      name: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      album: t.album.name,
      imageUrl: t.album.images?.[1]?.url || t.album.images?.[0]?.url || null,
      durationMs: t.duration_ms,
      previewUrl: t.preview_url,
    }));

    res.json({ success: true, data: tracks });
  } catch (error) {
    if (error.message === 'Spotify no conectado') {
      return res.status(503).json({ success: false, message: 'Spotify no conectado' });
    }
    next(error);
  }
};

const getPlaylist = async (req, res, next) => {
  try {
    const config = await SpotifyConfig.findOne();
    if (!config?.playlistId) {
      return res.json({ success: true, data: { connected: false, tracks: [] } });
    }

    // Base connection info — always return even if track fetch fails
    const base = {
      connected: true,
      playlistId: config.playlistId,
      playlistName: config.playlistName,
      playlistUrl: config.playlistUrl,
      playlistImageUrl: config.playlistImageUrl,
    };

    let tracks = [];
    try {
      const token = await getValidToken();
      const { data } = await axios.get(
        `https://api.spotify.com/v1/playlists/${config.playlistId}/tracks?fields=items(track(id,name,uri,artists,album(name,images),duration_ms))&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      tracks = (data.items || [])
        .filter(item => item.track)
        .map(item => ({
          id: item.track.id,
          uri: item.track.uri,
          name: item.track.name,
          artist: item.track.artists.map(a => a.name).join(', '),
          album: item.track.album.name,
          imageUrl: item.track.album.images?.[1]?.url || item.track.album.images?.[0]?.url || null,
          durationMs: item.track.duration_ms,
        }));
    } catch (spotifyErr) {
      console.error('Failed to fetch playlist tracks:', spotifyErr.response?.data || spotifyErr.message);
    }

    res.json({ success: true, data: { ...base, tracks } });
  } catch (error) {
    if (error.message === 'Spotify no conectado') {
      return res.json({ success: true, data: { connected: false, tracks: [] } });
    }
    next(error);
  }
};

const addTrack = async (req, res, next) => {
  try {
    const { uri } = req.body;
    if (!uri) return res.status(400).json({ success: false, message: 'URI requerido' });

    const config = await SpotifyConfig.findOne();
    if (!config?.playlistId) return res.status(503).json({ success: false, message: 'Spotify no conectado' });

    const token = await getValidToken();

    try {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${config.playlistId}/tracks`,
        { uris: [uri] },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
    } catch (spotifyErr) {
      const status = spotifyErr.response?.status;
      const spotifyMsg = spotifyErr.response?.data?.error?.message || spotifyErr.message;
      if (status === 403) {
        return res.status(403).json({ success: false, message: `Sin permiso de Spotify para modificar la playlist: ${spotifyMsg}` });
      }
      return res.status(502).json({ success: false, message: `Error de Spotify: ${spotifyMsg}` });
    }

    res.json({ success: true, message: 'Canción agregada a la playlist' });
  } catch (error) {
    if (error.message === 'Spotify no conectado') {
      return res.status(503).json({ success: false, message: 'Spotify no conectado' });
    }
    next(error);
  }
};

const removeTrack = async (req, res, next) => {
  try {
    const { uri } = req.body;
    if (!uri) return res.status(400).json({ success: false, message: 'URI requerido' });

    const config = await SpotifyConfig.findOne();
    if (!config?.playlistId) return res.status(503).json({ success: false, message: 'Spotify no conectado' });

    const token = await getValidToken();
    await axios.delete(
      `https://api.spotify.com/v1/playlists/${config.playlistId}/tracks`,
      {
        data: { tracks: [{ uri }] },
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      }
    );

    res.json({ success: true, message: 'Canción eliminada de la playlist' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuthUrl, handleCallback, getStatus, disconnect, searchTracks, getPlaylist, addTrack, removeTrack };
