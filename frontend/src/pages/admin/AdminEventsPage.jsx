import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';
import dayjs from 'dayjs';

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'training',
    date: '',
    endDate: '',
    location: '',
    isPublic: true,
    maxParticipants: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events');
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`/admin/events/${editingEvent._id}`, formData);
      } else {
        await axios.post('/admin/events', formData);
      }
      fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error al guardar el evento');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return;
    
    try {
      await axios.delete(`/admin/events/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error al eliminar el evento');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      date: dayjs(event.date).format('YYYY-MM-DDTHH:mm'),
      endDate: event.endDate ? dayjs(event.endDate).format('YYYY-MM-DDTHH:mm') : '',
      location: event.location,
      isPublic: event.isPublic,
      maxParticipants: event.maxParticipants || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'training',
      date: '',
      endDate: '',
      location: '',
      isPublic: true,
      maxParticipants: '',
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getEventTypeColor = (type) => {
    const colors = {
      training: 'bg-blue-100 text-blue-800',
      tournament: 'bg-purple-100 text-purple-800',
      social: 'bg-green-100 text-green-800',
      workshop: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-600">Crea y administra los eventos del club</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          Crear Evento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">PRÓXIMOS</p>
              <p className="text-4xl font-bold">{upcomingEvents.length}</p>
              <p className="text-sm opacity-75 mt-1">Eventos programados</p>
            </div>
            <Calendar className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">PÚBLICOS</p>
              <p className="text-4xl font-bold">{events.filter(e => e.isPublic).length}</p>
              <p className="text-sm opacity-75 mt-1">Visibles para todos</p>
            </div>
            <Users className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">COMPLETADOS</p>
              <p className="text-4xl font-bold">{pastEvents.length}</p>
              <p className="text-sm opacity-75 mt-1">Eventos pasados</p>
            </div>
            <Calendar className="w-12 h-12 opacity-20" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Eventos Próximos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {event.isPublic && (
                          <span className="badge badge-info">Public</span>
                        )}
                      </div>
                      <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{dayjs(event.date).format('MMMM D, YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{dayjs(event.date).format('h:mm A')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.participants?.filter(p => p.status === 'confirmed').length || 0} / {event.maxParticipants} participants
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Eventos Pasados</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pastEvents.slice(0, 4).map((event) => (
                <div key={event._id} className="card opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`badge ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-2">
                        {event.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{dayjs(event.date).format('MMMM D, YYYY')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay eventos</h3>
            <p className="text-gray-600 mb-4">Crea tu primer evento para comenzar</p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus className="w-5 h-5" />
              Crear Evento
            </button>
          </div>
        )}
      </div>

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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="title" className="label">Título del Evento *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Torneo de Vóley Playa de Verano"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="label">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="input resize-none"
                    placeholder="Detalles e información del evento..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="label">Tipo de Evento *</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="training">Entrenamiento</option>
                      <option value="tournament">Torneo</option>
                      <option value="social">Social</option>
                      <option value="workshop">Taller</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="location" className="label">Ubicación *</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="Playa Grande, Manizales"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="label">Fecha y Hora de Inicio *</label>
                    <input
                      type="datetime-local"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="label">Fecha y Hora de Fin</label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="maxParticipants" className="label">Máximo de Participantes</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    min="1"
                    className="input"
                    placeholder="Dejar vacío para ilimitado"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-200"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                    Hacer este evento público (visible para todos los miembros)
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingEvent ? 'Actualizar Evento' : 'Crear Evento'}
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

export default AdminEventsPage;
