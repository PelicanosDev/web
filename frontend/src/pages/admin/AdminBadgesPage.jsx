import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

function AdminBadgesPage() {
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
    criteria: {
      type: 'special',
      value: 0,
      description: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [filterCategory, filterRarity]);

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
      console.error('Error saving badge:', error);
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
      console.error('Error deleting badge:', error);
      alert('Error al eliminar la insignia');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBadge(null);
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      category: 'achievement',
      rarity: 'common',
      xpReward: 100,
      criteria: {
        type: 'special',
        value: 0,
        description: ''
      }
    });
  };

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rarityAccent = {
    common: 'border-l-4 border-slate-400',
    rare: 'border-l-4 border-sky-500',
    epic: 'border-l-4 border-purple-500',
    legendary: 'border-l-4 border-amber-500'
  };

  const rarityBadgeColors = {
    common: 'bg-slate-100 text-slate-700',
    rare: 'bg-sky-100 text-sky-700',
    epic: 'bg-purple-100 text-purple-700',
    legendary: 'bg-amber-100 text-amber-700'
  };

  const categoryLabels = {
    attendance: 'Asistencia',
    performance: 'Rendimiento',
    achievement: 'Logros',
    special: 'Especial'
  };

  const rarityLabels = {
    common: 'Común',
    rare: 'Rara',
    epic: 'Épica',
    legendary: 'Legendaria'
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
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
            Gamificación
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
            Insignias
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nueva Insignia
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
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
            className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white md:w-48"
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
            className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white md:w-48"
          >
            <option value="">Todas las rarezas</option>
            <option value="common">Común</option>
            <option value="rare">Rara</option>
            <option value="epic">Épica</option>
            <option value="legendary">Legendaria</option>
          </select>
        </div>
      </div>

      {/* Badge grid */}
      {filteredBadges.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm p-6">
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              No se encontraron insignias
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => (
            <motion.div
              key={badge._id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative bg-white border border-slate-100 shadow-sm p-6 ${rarityAccent[badge.rarity]} hover:shadow-md transition-shadow group`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{badge.icon}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(badge)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(badge._id)}
                    className="p-2 bg-slate-50 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-display font-black uppercase text-slate-900 text-base leading-tight mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">{badge.description}</p>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${rarityBadgeColors[badge.rarity]}`}>
                  {rarityLabels[badge.rarity]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    {categoryLabels[badge.category]}
                  </span>
                  <span className="text-xs font-bold text-primary-500">+{badge.xpReward} XP</span>
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
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-2 py-1 mb-1">
                    {editingBadge ? 'Editar' : 'Nueva'}
                  </span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    {editingBadge ? 'Editar Insignia' : 'Nueva Insignia'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Icono (Emoji) *
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white text-3xl text-center"
                      required
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      required
                    >
                      <option value="attendance">Asistencia</option>
                      <option value="performance">Rendimiento</option>
                      <option value="achievement">Logros</option>
                      <option value="special">Especial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Rareza *
                    </label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      required
                    >
                      <option value="common">Común</option>
                      <option value="rare">Rara</option>
                      <option value="epic">Épica</option>
                      <option value="legendary">Legendaria</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Recompensa XP *
                    </label>
                    <input
                      type="number"
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      required
                      min={0}
                    />
                  </div>
                </div>

                {/* Criteria section */}
                <div className="border-t border-slate-200 pt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                    Criterios (Opcional)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Tipo de Criterio
                      </label>
                      <select
                        value={formData.criteria.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: { ...formData.criteria, type: e.target.value }
                        })}
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
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
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Valor
                      </label>
                      <input
                        type="number"
                        value={formData.criteria.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: { ...formData.criteria, value: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Descripción del Criterio
                    </label>
                    <input
                      type="text"
                      value={formData.criteria.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        criteria: { ...formData.criteria, description: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      placeholder="Ej: Asistir a 10 entrenamientos"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer flex-1"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={submitting}
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

export default AdminBadgesPage;
