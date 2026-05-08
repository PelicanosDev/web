import { useState, useEffect } from 'react';
import axios from '@/api/axios';
import { FolderOpen, FileText, Video, Plus, Trash2, ExternalLink, Upload, Link as LinkIcon, X } from 'lucide-react';

const DOCUMENT_CATEGORIES = [
  { value: 'policy', label: 'Política de Datos' },
  { value: 'regulation', label: 'Reglamento' },
  { value: 'form', label: 'Formulario' },
  { value: 'announcement', label: 'Comunicado' },
  { value: 'other', label: 'Otro' },
];

const VIDEO_CATEGORIES = [
  { value: 'home_workout', label: 'Rutina en Casa' },
  { value: 'technique', label: 'Técnica' },
  { value: 'warmup', label: 'Calentamiento' },
  { value: 'other', label: 'Otro' },
];

const CATEGORY_LABELS = {
  policy: 'Política de Datos',
  regulation: 'Reglamento',
  form: 'Formulario',
  announcement: 'Comunicado',
  home_workout: 'Rutina en Casa',
  technique: 'Técnica',
  warmup: 'Calentamiento',
  other: 'Otro',
};

function ResourceModal({ type, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [videoMode, setVideoMode] = useState('url'); // 'url' | 'file'
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = type === 'document' ? DOCUMENT_CATEGORIES : VIDEO_CATEGORIES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError('El título es obligatorio');
    if (type === 'document' && !file) return setError('Debes seleccionar un archivo PDF o DOC');
    if (type === 'video' && videoMode === 'url' && !videoUrl.trim()) return setError('Debes ingresar una URL de video');
    if (type === 'video' && videoMode === 'file' && !file) return setError('Debes seleccionar un archivo de video');

    if (file && file.size > 20 * 1024 * 1024 && type === 'document') {
      return setError('El archivo no debe superar 20MB');
    }

    setSubmitting(true);
    setError('');
    try {
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('type', type);
      form.append('category', category);
      if (file) form.append('file', file);
      if (type === 'video' && videoMode === 'url') form.append('videoUrl', videoUrl);

      await axios.post('/admin/resources', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-display font-bold uppercase tracking-wide text-slate-900">
            {type === 'document' ? 'Nuevo Documento' : 'Nuevo Video'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="Nombre del recurso"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="Descripción opcional"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {type === 'document' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Archivo (PDF, DOC) *
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:bg-slate-900 file:text-white file:text-xs file:font-bold file:uppercase file:tracking-wide cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-1">Máximo 20MB</p>
            </div>
          )}

          {type === 'video' && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVideoMode('url')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide border transition-colors ${
                    videoMode === 'url'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Enlace externo
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('file')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide border transition-colors ${
                    videoMode === 'file'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir archivo
                </button>
              </div>

              {videoMode === 'url' ? (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    URL de YouTube / Vimeo *
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                    Archivo de video *
                  </label>
                  <input
                    type="file"
                    accept=".mp4,.mov,.webm,.avi"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:bg-slate-900 file:text-white file:text-xs file:font-bold file:uppercase file:tracking-wide cursor-pointer"
                  />
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-500 text-white text-sm font-bold uppercase tracking-wide hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResourceCard({ resource, onDelete }) {
  const isDocument = resource.type === 'document';

  return (
    <div className="bg-white border border-slate-200 p-4 flex items-start gap-4">
      <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${isDocument ? 'bg-blue-100' : 'bg-purple-100'}`}>
        {isDocument
          ? <FileText className="w-5 h-5 text-blue-600" />
          : <Video className="w-5 h-5 text-purple-600" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm truncate">{resource.title}</p>
        {resource.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{resource.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-0.5">
            {CATEGORY_LABELS[resource.category] || resource.category}
          </span>
          <span className="text-[10px] text-slate-400">
            {new Date(resource.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {(resource.fileUrl || resource.videoUrl) && (
          <a
            href={resource.fileUrl || resource.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-primary-500 transition-colors"
            title="Ver"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => onDelete(resource._id)}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminResourcesPage() {
  const [tab, setTab] = useState('document');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/resources?type=${tab}`);
      setResources(res.data.data);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, [tab]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este recurso?')) return;
    try {
      await axios.delete(`/admin/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl uppercase tracking-wide text-slate-900">Recursos</h1>
            <p className="text-xs text-slate-500">Documentos y videos del club</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar {tab === 'document' ? 'Documento' : 'Video'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        {[{ key: 'document', label: 'Documentos', icon: FileText }, { key: 'video', label: 'Videos', icon: Video }].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${
              tab === key
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            No hay {tab === 'document' ? 'documentos' : 'videos'} aún
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => (
            <ResourceCard key={r._id} resource={r} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <ResourceModal
          type={tab}
          onClose={() => setShowModal(false)}
          onSaved={fetchResources}
        />
      )}
    </div>
  );
}
