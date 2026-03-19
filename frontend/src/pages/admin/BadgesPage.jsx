import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

const inputCls = 'w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white';
const labelCls = 'block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2';

const rarityColors = {
  common: 'bg-slate-100 text-slate-700',
  rare: 'bg-sky-100 text-sky-800',
  epic: 'bg-purple-100 text-purple-800',
  legendary: 'bg-amber-100 text-amber-800',
};

const rarityBorder = {
  common: 'border-slate-300',
  rare: 'border-sky-300',
  epic: 'border-purple-300',
  legendary: 'border-amber-400',
};

const categoryLabels = {
  attendance: 'Asistencia',
  performance: 'Rendimiento',
  achievement: 'Logros',
  special: 'Especial',
};

function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'achievement',
    rarity: 'common',
    xpReward: 100,
    criteria: { type: 'special', value: 0, description: '' }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchBadges(); }, [filterCategory, filterRarity]);

  const fetchBadges = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterRarity) params.rarity = filterRarity;
      const response = await axios.get('/badges', { params });
      setBadges(response.data.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBadge) {
        await axios.put(`/badges/${editingBadge._id}`, formData);
      } else {
        await axios.post('/badges', formData);
      }
      fetchBadges();
      handleCloseModal();
    } catch (error) {
      alert('Error al guardar la insignia: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
      criteria: badge.criteria
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta insignia?')) return;
    try {
      await axios.delete(`/badges/${id}`);
      fetchBadges();
    } catch (error) {
      alert('Error al eliminar la insignia');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBadge(null);
    setFormData({ name: '', description: '', icon: '🏆', category: 'achievement', rarity: 'common', xpReward: 100, criteria: { type: 'special', value: 0, description: '' } });
  };

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
            Gamificación
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
            Insignias
          </h1>
          <p className="text-slate-500 mt-1">Gestiona las insignias del club</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nueva Insignia
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar insignias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white sm:w-48"
          >
            <option value="">Todas las categorías</option>
            <option value="attendance">Asistencia</option>
            <option value="performance">Rendimiento</option>
            <option value="achievement">Logros</option>
            <option value="special">Especial</option>
          </select>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white sm:w-48"
          >
            <option value="">Todas las rarezas</option>
            <option value="common">Común</option>
            <option value="rare">Rara</option>
            <option value="epic">Épica</option>
            <option value="legendary">Legendaria</option>
          </select>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <motion.div
            key={badge._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border-2 ${rarityBorder[badge.rarity]} shadow-sm p-6 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-4xl">{badge.icon}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(badge)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(badge._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-display font-black uppercase text-slate-900 text-lg leading-tight mb-1">{badge.name}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{badge.description}</p>

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${rarityColors[badge.rarity]}`}>
                {badge.rarity}
              </span>
              <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1">
                +{badge.xpReward} XP
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {categoryLabels[badge.category] || badge.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="bg-white border border-slate-100 shadow-sm text-center py-16">
          <Award className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No se encontraron insignias</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-0.5">Insignias</p>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    {editingBadge ? 'Editar Insignia' : 'Nueva Insignia'}
                  </h2>
                </div>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Icono (Emoji) *</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className={`${inputCls} text-3xl text-center`}
                      required
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Descripción *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`${inputCls} resize-none`}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Categoría *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={inputCls}
                      required
                    >
                      <option value="attendance">Asistencia</option>
                      <option value="performance">Rendimiento</option>
                      <option value="achievement">Logros</option>
                      <option value="special">Especial</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Rareza *</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                      className={inputCls}
                      required
                    >
                      <option value="common">Común</option>
                      <option value="rare">Rara</option>
                      <option value="epic">Épica</option>
                      <option value="legendary">Legendaria</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Recompensa XP *</label>
                    <input
                      type="number"
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                      className={inputCls}
                      required
                      min={0}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Criterios (Opcional)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Tipo de Criterio</label>
                      <select
                        value={formData.criteria.type}
                        onChange={(e) => setFormData({ ...formData, criteria: { ...formData.criteria, type: e.target.value } })}
                        className={inputCls}
                      >
                        <option value="special">Especial</option>
                        <option value="attendance_count">Conteo de Asistencia</option>
                        <option value="win_count">Conteo de Victorias</option>
                        <option value="tournament_wins">Victorias en Torneos</option>
                        <option value="level_reached">Nivel Alcanzado</option>
                        <option value="metric_improvement">Mejora de Métrica</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Valor</label>
                      <input
                        type="number"
                        value={formData.criteria.value}
                        onChange={(e) => setFormData({ ...formData, criteria: { ...formData.criteria, value: parseInt(e.target.value) } })}
                        className={inputCls}
                        min={0}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>Descripción del Criterio</label>
                    <input
                      type="text"
                      value={formData.criteria.description}
                      onChange={(e) => setFormData({ ...formData, criteria: { ...formData.criteria, description: e.target.value } })}
                      className={inputCls}
                      placeholder="Ej: Asistir a 10 entrenamientos"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 inline-flex items-center justify-center bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Guardando...' : editingBadge ? 'Actualizar' : 'Crear'}
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

export default BadgesPage;
