import { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, Edit, Trash2, X, Clock, Navigation, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';
import dayjs from 'dayjs';

function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [attendanceEvent, setAttendanceEvent] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'training',
    date: '',
    endDate: '',
    location: '',
    isPublic: true,
    maxParticipants: '',
    totalDays: 1,
    coordinatesLat: '',
    coordinatesLng: '',
    radius: 50,
    recurringEnabled: false,
    recurringDays: [],
    recurringStartTime: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/admin/events', { params: { limit: 200 } });
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
      const payload = { ...formData };
      if (formData.type === 'training' && formData.coordinatesLat && formData.coordinatesLng) {
        payload.coordinates = {
          lat: parseFloat(formData.coordinatesLat),
          lng: parseFloat(formData.coordinatesLng)
        };
      }
      delete payload.coordinatesLat;
      delete payload.coordinatesLng;
      if (formData.type === 'training') {
        payload.recurring = {
          enabled: formData.recurringEnabled,
          daysOfWeek: formData.recurringDays.map(Number),
          startTime: formData.recurringStartTime
        };
      }
      delete payload.recurringEnabled;
      delete payload.recurringDays;
      delete payload.recurringStartTime;

      // Ensure numeric fields are numbers, not strings from HTML inputs
      if (payload.radius !== '') payload.radius = parseFloat(payload.radius) || 50;
      if (payload.totalDays !== '') payload.totalDays = parseInt(payload.totalDays) || 1;
      if (payload.maxParticipants !== '') payload.maxParticipants = payload.maxParticipants ? parseInt(payload.maxParticipants) : null;

      if (editingEvent) {
        await axios.put(`/admin/events/${editingEvent._id}`, payload);
      } else {
        await axios.post('/admin/events', payload);
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
      totalDays: event.totalDays || 1,
      coordinatesLat: event.coordinates?.lat || '',
      coordinatesLng: event.coordinates?.lng || '',
      radius: event.radius || 50,
      recurringEnabled: event.recurring?.enabled || false,
      recurringDays: event.recurring?.daysOfWeek?.map(String) || [],
      recurringStartTime: event.recurring?.startTime || '',
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
      totalDays: 1,
      coordinatesLat: '',
      coordinatesLng: '',
      radius: 50,
      recurringEnabled: false,
      recurringDays: [],
      recurringStartTime: '',
    });
  };

  const handleViewAttendance = async (event) => {
    setAttendanceEvent(event);
    setLoadingAttendance(true);
    setAttendanceData(null);
    try {
      const response = await axios.get(`/admin/events/${event._id}`);
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleUseMyLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData(prev => ({
        ...prev,
        coordinatesLat: position.coords.latitude.toString(),
        coordinatesLng: position.coords.longitude.toString()
      }));
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
      training: 'bg-sky-100 text-sky-800',
      tournament: 'bg-purple-100 text-purple-800',
      social: 'bg-green-100 text-green-800',
      workshop: 'bg-orange-100 text-orange-800',
      other: 'bg-slate-100 text-slate-800',
    };
    return colors[type] || colors.other;
  };

  const getEventTypeLabel = (type) => {
    const labels = { training: 'Entrenamiento', tournament: 'Torneo', social: 'Social', workshop: 'Taller', other: 'Otro' };
    return labels[type] || type;
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
            Club Pelícanos
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
            Gestión de Eventos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Crea y administra los eventos del club</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Crear Evento
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-6 border-l-4 border-primary-500">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Próximos</p>
          <p className="text-4xl font-display font-black text-primary-400">{upcomingEvents.length}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Eventos programados</p>
        </div>
        <div className="bg-slate-900 p-6 border-l-4 border-primary-500">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Públicos</p>
          <p className="text-4xl font-display font-black text-primary-400">{events.filter(e => e.isPublic).length}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Visibles para todos</p>
        </div>
        <div className="bg-slate-900 p-6 border-l-4 border-primary-500">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Completados</p>
          <p className="text-4xl font-display font-black text-primary-400">{pastEvents.length}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Eventos pasados</p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-8">
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-4">
              Eventos Próximos
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-100 shadow-sm p-6 border-l-4 border-l-primary-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${getEventTypeColor(event.type)}`}>
                          {getEventTypeLabel(event.type)}
                        </span>
                        {event.isPublic && (
                          <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-600">
                            Público
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black uppercase text-slate-900 text-lg leading-none mb-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-slate-500 text-sm mb-3">{event.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      {event.type === 'training' && (
                        <button
                          onClick={() => handleViewAttendance(event)}
                          className="p-2 hover:bg-sky-50 transition-colors"
                          title="Ver Asistencia"
                        >
                          <BarChart2 className="w-4 h-4 text-sky-500" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 hover:bg-slate-100 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-500">
                    {event.recurring?.enabled ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400" />
                        <span className="text-sky-600 font-semibold">
                          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
                            .filter((_, i) => event.recurring.daysOfWeek?.includes(i))
                            .join(', ')}
                          {event.recurring.startTime ? ` · ${event.recurring.startTime}` : ''}
                          {' — Recurrente'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{dayjs(event.date).format('D [de] MMMM[,] YYYY')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{dayjs(event.date).format('h:mm A')}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{event.location}</span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>
                          {event.participants?.filter(p => p.status === 'confirmed').length || 0} / {event.maxParticipants} participantes
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
            <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-4">
              Eventos Pasados
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pastEvents.slice(0, 4).map((event) => (
                <div key={event._id} className="bg-white border border-slate-100 shadow-sm p-6 border-l-4 border-l-slate-300 opacity-75">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                      <h3 className="font-display font-bold uppercase text-slate-700 text-base mt-2">
                        {event.title}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      {event.type === 'training' && (
                        <button
                          onClick={() => handleViewAttendance(event)}
                          className="p-2 hover:bg-sky-50 transition-colors"
                          title="Ver Asistencia"
                        >
                          <BarChart2 className="w-4 h-4 text-sky-500" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>{dayjs(event.date).format('D [de] MMMM[,] YYYY')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="bg-white border border-slate-100 shadow-sm p-6 text-center py-16">
            <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">Sin Eventos</h3>
            <p className="text-slate-400 text-sm uppercase tracking-wide mb-6">Crea tu primer evento para comenzar</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Crear Evento
            </button>
          </div>
        )}
      </div>

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1 mb-2">
                    {editingEvent ? 'Editando' : 'Nuevo'}
                  </span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    {editingEvent ? 'Editar Evento' : 'Crear Evento'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Título del Evento *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    placeholder="Torneo de Vóley Playa de Verano"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white resize-none"
                    placeholder="Detalles e información del evento..."
                  />
                </div>

                {/* Type & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Tipo de Evento *
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    >
                      <option value="training">Entrenamiento</option>
                      <option value="tournament">Torneo</option>
                      <option value="social">Social</option>
                      <option value="workshop">Taller</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      placeholder="Playa Grande, Manizales"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Fecha y Hora de Inicio *
                    </label>
                    <input
                      type="datetime-local"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Fecha y Hora de Fin
                    </label>
                    <input
                      type="datetime-local"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Max Participants */}
                <div>
                  <label htmlFor="maxParticipants" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Máximo de Participantes
                  </label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    placeholder="Dejar vacío para ilimitado"
                  />
                </div>

                {/* Public toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                  <label htmlFor="isPublic" className="text-sm font-bold text-slate-600 uppercase tracking-wide">
                    Hacer este evento público (visible para todos los miembros)
                  </label>
                </div>

                {/* Training-specific fields */}
                {formData.type === 'training' && (
                  <div className="space-y-4 bg-sky-50 border-2 border-sky-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-600">Opciones de Entrenamiento</p>

                    {/* Total Days */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Duración (días)
                      </label>
                      <input
                        type="number"
                        name="totalDays"
                        value={formData.totalDays}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    {/* Coordinates */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Coordenadas para Check-in
                      </label>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <input
                          type="number"
                          step="any"
                          name="coordinatesLat"
                          value={formData.coordinatesLat}
                          onChange={handleChange}
                          placeholder="Latitud"
                          className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                        />
                        <input
                          type="number"
                          step="any"
                          name="coordinatesLng"
                          value={formData.coordinatesLng}
                          onChange={handleChange}
                          placeholder="Longitud"
                          className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Usar mi ubicación actual
                      </button>
                    </div>

                    {/* Radius */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                        Radio de Check-in (metros)
                      </label>
                      <input
                        type="number"
                        name="radius"
                        value={formData.radius}
                        onChange={handleChange}
                        min="10"
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    {/* Recurring */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          id="recurringEnabled"
                          checked={formData.recurringEnabled}
                          onChange={(e) => setFormData(prev => ({ ...prev, recurringEnabled: e.target.checked }))}
                          className="w-4 h-4 text-sky-500 focus:ring-2 focus:ring-sky-200"
                        />
                        <label htmlFor="recurringEnabled" className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                          Entrenamiento recurrente (sin fecha de fin)
                        </label>
                      </div>
                      {formData.recurringEnabled && (
                        <div className="space-y-3 pl-7">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Días de la semana</p>
                            <div className="flex flex-wrap gap-2">
                              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, idx) => (
                                <label key={idx} className={`flex items-center justify-center w-12 h-10 cursor-pointer text-xs font-bold uppercase transition-colors ${
                                  formData.recurringDays.includes(String(idx))
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}>
                                  <input
                                    type="checkbox"
                                    value={String(idx)}
                                    checked={formData.recurringDays.includes(String(idx))}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setFormData(prev => ({
                                        ...prev,
                                        recurringDays: prev.recurringDays.includes(v)
                                          ? prev.recurringDays.filter(d => d !== v)
                                          : [...prev.recurringDays, v]
                                      }));
                                    }}
                                    className="hidden"
                                  />
                                  {day}
                                </label>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                              Hora de inicio
                            </label>
                            <input
                              type="time"
                              value={formData.recurringStartTime}
                              onChange={(e) => setFormData(prev => ({ ...prev, recurringStartTime: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer flex-1"
                  >
                    {editingEvent ? 'Actualizar Evento' : 'Crear Evento'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attendance Modal */}
      <AnimatePresence>
        {attendanceEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setAttendanceEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div>
                  <span className="inline-block text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1 mb-1">
                    Asistencia
                  </span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    {attendanceEvent.title}
                  </h2>
                </div>
                <button onClick={() => setAttendanceEvent(null)} className="p-2 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
                {loadingAttendance ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-sky-500 rounded-full animate-spin" />
                  </div>
                ) : !attendanceData ? (
                  <p className="text-center text-slate-400 py-8">Error al cargar datos</p>
                ) : (() => {
                  const participants = attendanceData.participants?.filter(p => p.status === 'confirmed') || [];
                  const attendance = attendanceData.dailyAttendance || [];

                  // Get unique dates sorted descending
                  const dates = [...new Set(attendance.map(a => new Date(a.date).toDateString()))]
                    .sort((a, b) => new Date(b) - new Date(a));

                  // Build a lookup: memberId -> [dates checked in]
                  const checkInsByMember = {};
                  attendance.forEach(a => {
                    const mid = (a.memberId?._id || a.memberId)?.toString();
                    if (!checkInsByMember[mid]) checkInsByMember[mid] = new Set();
                    checkInsByMember[mid].add(new Date(a.date).toDateString());
                  });

                  return (
                    <div className="space-y-6">
                      {/* Summary stats */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900 p-4 border-l-4 border-sky-500 text-center">
                          <p className="font-display font-black text-3xl text-sky-400">{participants.length}</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Inscritos</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 border-l-4 border-emerald-400 text-center">
                          <p className="font-display font-black text-3xl text-emerald-500">{attendance.length}</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Check-ins Totales</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-4 border-l-4 border-primary-400 text-center">
                          <p className="font-display font-black text-3xl text-primary-500">{dates.length}</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Días con Asist.</p>
                        </div>
                      </div>

                      {participants.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No hay participantes inscritos</p>
                      ) : (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                            Asistencia por Miembro
                          </p>
                          <div className="space-y-2">
                            {participants.map((p) => {
                              const member = p.memberId;
                              const memberId = (member?._id || member)?.toString();
                              const memberCheckins = checkInsByMember[memberId] || new Set();
                              const name = member?.userId?.profile
                                ? `${member.userId.profile.firstName} ${member.userId.profile.lastName}`
                                : member?.memberNumber || memberId?.slice(-6) || 'Miembro';
                              const memberNumber = member?.memberNumber || '';

                              return (
                                <div key={memberId} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200">
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{name}</p>
                                    {memberNumber && <p className="text-xs text-slate-400">{memberNumber}</p>}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500 font-bold">
                                      {memberCheckins.size} {memberCheckins.size === 1 ? 'día' : 'días'}
                                    </span>
                                    {memberCheckins.size > 0
                                      ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                                      : <XCircle className="w-5 h-5 text-red-300" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {dates.length > 0 && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                            Historial por Fecha
                          </p>
                          <div className="space-y-3">
                            {dates.map(dateStr => {
                              const dayCheckins = attendance.filter(a => new Date(a.date).toDateString() === dateStr);
                              return (
                                <div key={dateStr} className="border border-slate-200 overflow-hidden">
                                  <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
                                      {new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <span className="text-sky-400 font-bold text-sm">{dayCheckins.length} presentes</span>
                                  </div>
                                  <div className="divide-y divide-slate-100">
                                    {dayCheckins.map((a, i) => {
                                      const m = a.memberId;
                                      const n = m?.userId?.profile
                                        ? `${m.userId.profile.firstName} ${m.userId.profile.lastName}`
                                        : m?.memberNumber || 'Miembro';
                                      const time = a.checkInTime
                                        ? new Date(a.checkInTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                        : '';
                                      return (
                                        <div key={i} className="flex items-center justify-between px-4 py-2 bg-white">
                                          <span className="text-sm text-slate-700 font-medium">{n}</span>
                                          {time && <span className="text-xs text-slate-400">{time}</span>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {attendance.length === 0 && (
                        <div className="text-center py-8">
                          <BarChart2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                          <p className="text-slate-400 text-sm">Aún no hay registros de asistencia</p>
                          <p className="text-slate-300 text-xs mt-1">Los miembros deben marcar asistencia desde su panel</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminEventsPage;
