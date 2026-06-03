import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, X, Upload, Trophy, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';
import dayjs from 'dayjs';

const CATEGORIES = [
  { value: 'arena_tour', label: 'Arena Tour Colombia' },
  { value: 'copa_rookies', label: 'Copa Rookies' },
  { value: 'liga', label: 'Liga Departamental' },
  { value: 'rey_de_cancha', label: 'Rey de Cancha' },
  { value: 'otro', label: 'Otro' },
];

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Próximo' },
  { value: 'ongoing', label: 'En curso' },
  { value: 'completed', label: 'Finalizado' },
];

const emptyForm = {
  name: '',
  location: '',
  date: '',
  endDate: '',
  category: 'otro',
  status: 'upcoming',
  description: '',
  result: '',
  position: '',
  participants: '',
  isPublic: true,
};

function AdminClubTournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchTournaments(); }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/club-tournaments/admin');
      setTournaments(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setFormData({
      name: t.name,
      location: t.location || '',
      date: t.date ? dayjs(t.date).format('YYYY-MM-DD') : '',
      endDate: t.endDate ? dayjs(t.endDate).format('YYYY-MM-DD') : '',
      category: t.category || 'otro',
      status: t.status || 'upcoming',
      description: t.description || '',
      result: t.result || '',
      position: t.position || '',
      participants: (t.participants || []).join(', '),
      isPublic: t.isPublic !== false,
    });
    setSelectedFile(null);
    setPreviewUrl(t.imageUrl || null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
    setEditing(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Solo imágenes'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Máximo 5MB'); return; }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'participants') {
          const arr = v.split(',').map(s => s.trim()).filter(Boolean);
          arr.forEach(p => fd.append('participants[]', p));
        } else {
          fd.append(k, v);
        }
      });
      if (selectedFile) fd.append('image', selectedFile);

      if (editing) {
        await axios.put(`/club-tournaments/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/club-tournaments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      fetchTournaments();
      closeModal();
    } catch (error) {
      console.error(error);
      alert('Error al guardar: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este torneo?')) return;
    try {
      await axios.delete(`/club-tournaments/${id}`);
      fetchTournaments();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const statusBadge = (status) => {
    const map = { upcoming: 'bg-primary-100 text-primary-700', ongoing: 'bg-green-100 text-green-700', completed: 'bg-slate-100 text-slate-600' };
    const labels = { upcoming: 'Próximo', ongoing: 'En curso', completed: 'Finalizado' };
    return <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${map[status] || 'bg-slate-100 text-slate-600'}`}>{labels[status] || status}</span>;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">Club</span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">Torneos del Club</h1>
          <p className="text-slate-500 text-sm mt-1">Gestiona los torneos en los que participa el club</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agregar Torneo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Próximos', value: tournaments.filter(t => t.status === 'upcoming').length, cls: 'bg-slate-900 text-primary-400' },
          { label: 'En curso', value: tournaments.filter(t => t.status === 'ongoing').length, cls: 'bg-white text-green-600' },
          { label: 'Finalizados', value: tournaments.filter(t => t.status === 'completed').length, cls: 'bg-white text-slate-700' },
        ].map(s => (
          <div key={s.label} className={`p-5 border-l-4 border-primary-500 shadow-sm ${s.cls.includes('bg-slate-900') ? s.cls : 'bg-white border border-slate-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${s.cls.includes('bg-slate-900') ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
            <p className={`font-display font-black text-3xl ${s.cls.split(' ').find(c => c.startsWith('text-'))}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {tournaments.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm p-12 text-center">
          <Trophy className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">Sin torneos</h3>
          <p className="text-slate-400 text-sm mb-6">Agrega el primer torneo del club</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer">
            <Plus className="w-4 h-4" /> Agregar Torneo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tournaments.map((t) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 shadow-sm overflow-hidden border-l-4 border-l-primary-500"
            >
              <div className="flex">
                {t.imageUrl && (
                  <img src={t.imageUrl} alt={t.name} className="w-28 h-full object-cover flex-shrink-0" />
                )}
                <div className="p-5 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex gap-2 flex-wrap">
                      {statusBadge(t.status)}
                      {!t.isPublic && <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-red-100 text-red-600">Oculto</span>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-slate-100 transition-colors">
                        <Edit className="w-4 h-4 text-slate-500" />
                      </button>
                      <button onClick={() => handleDelete(t._id)} className="p-1.5 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display font-black uppercase text-slate-900 text-base leading-tight mb-2">{t.name}</h3>
                  <div className="space-y-1">
                    {t.date && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {dayjs(t.date).format('D MMM YYYY')}
                        {t.endDate && ` — ${dayjs(t.endDate).format('D MMM YYYY')}`}
                      </p>
                    )}
                    {t.location && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {t.location}
                      </p>
                    )}
                    {t.position && (
                      <p className="text-xs font-bold text-primary-600">Posición: #{t.position}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-2 py-1 mb-1">
                    {editing ? 'Editando' : 'Nuevo'}
                  </span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    {editing ? 'Editar Torneo' : 'Agregar Torneo'}
                  </h2>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 transition-colors" disabled={submitting}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Image */}
                <div
                  className="border-2 border-dashed border-slate-300 hover:border-primary-400 transition-colors cursor-pointer p-5 text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="max-h-40 mx-auto object-contain" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wide">Subir imagen del torneo</p>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del Torneo *</label>
                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white" placeholder="Ej: Arena Tour Medellín 2024" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Categoría</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white">
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fecha de inicio</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fecha de fin</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Lugar</label>
                    <input name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white" placeholder="Ej: Estadio de Playitas, Medellín" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descripción</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white resize-none" placeholder="Detalles del torneo..." />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Posición obtenida</label>
                    <input type="number" name="position" value={formData.position} onChange={handleChange} min="1" className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white" placeholder="Ej: 1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Resultado / Nota</label>
                    <input name="result" value={formData.result} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white" placeholder="Ej: Campeones, Semifinalistas..." />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Atletas participantes (separados por coma)</label>
                    <input name="participants" value={formData.participants} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none text-slate-900 bg-white" placeholder="Ej: Daniel Castaño, María López" />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-3">
                    <input type="checkbox" name="isPublic" id="isPublic" checked={formData.isPublic} onChange={handleChange} className="w-4 h-4 accent-primary-500" />
                    <label htmlFor="isPublic" className="text-sm font-bold text-slate-600 uppercase tracking-wide">Visible en la página pública</label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={closeModal} disabled={submitting} className="flex-1 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all disabled:opacity-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {submitting ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Torneo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminClubTournamentsPage;
