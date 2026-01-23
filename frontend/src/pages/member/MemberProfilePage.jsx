import { useState, useEffect } from 'react';
import { User, Phone, Calendar, MapPin, AlertTriangle, Activity, Edit2, Save, X, Heart, Briefcase, GraduationCap, Instagram, Lock } from 'lucide-react';
import axios from '@/api/axios';
import { useAuth } from '@/features/auth/context/AuthContext';
import RegistrationProgress from '@/components/profile/RegistrationProgress';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';

function MemberProfilePage() {
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    // Datos personales
    phone: '',
    gender: '',
    dateOfBirth: '',
    idType: '',
    idNumber: '',
    address: '',
    
    // Información médica
    eps: '',
    bloodType: '',
    allergies: '',
    
    // Contacto de emergencia
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Perfil deportivo
    position: '',
    experience: '',
    height: '',
    weight: '',
    shirtSize: '',
    pantsSize: '',
    shoeSize: '',
    
    // Información adicional
    occupation: '',
    studyLevel: '',
    instagram: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const response = await axios.get('/members/me');
      setMember(response.data.data);
      
      const memberData = response.data.data;
      setFormData({
        phone: memberData.userId?.profile?.phone || '',
        gender: memberData.userId?.profile?.gender || '',
        dateOfBirth: memberData.userId?.profile?.dateOfBirth?.split('T')[0] || '',
        idType: memberData.userId?.profile?.idType || '',
        idNumber: memberData.userId?.profile?.idNumber || '',
        address: memberData.userId?.profile?.address || '',
        eps: memberData.medicalInfo?.eps || '',
        bloodType: memberData.medicalInfo?.bloodType || '',
        allergies: memberData.medicalInfo?.allergies || '',
        emergencyContactName: memberData.emergencyContact?.name || '',
        emergencyContactPhone: memberData.emergencyContact?.phone || '',
        emergencyContactRelation: memberData.emergencyContact?.relation || '',
        position: memberData.sportProfile?.position || '',
        experience: memberData.sportProfile?.experience || '',
        height: memberData.sportProfile?.height || '',
        weight: memberData.sportProfile?.weight || '',
        shirtSize: memberData.sportProfile?.shirtSize || '',
        pantsSize: memberData.sportProfile?.pantsSize || '',
        shoeSize: memberData.sportProfile?.shoeSize || '',
        occupation: memberData.additionalInfo?.occupation || '',
        studyLevel: memberData.additionalInfo?.studyLevel || '',
        instagram: memberData.socialMedia?.instagram || ''
      });
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put('/members/me/profile', formData);
      alert('Perfil actualizado exitosamente');
      setEditing(false);
      fetchMemberData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Completa tu información de inscripción</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn btn-primary"
          >
            <Edit2 className="w-5 h-5" />
            Editar Perfil
          </button>
        )}
      </div>

      {/* Progreso de Inscripción */}
      {member && <RegistrationProgress member={member} />}

      {/* Información del Usuario */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-500">
                {member?.userId?.profile?.firstName?.[0]}{member?.userId?.profile?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {member?.userId?.profile?.firstName} {member?.userId?.profile?.lastName}
              </h2>
              <p className="text-gray-600">{member?.userId?.email}</p>
              <p className="text-sm text-gray-500">Miembro #{member?.memberNumber}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary btn-sm flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Cambiar Contraseña
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Datos Personales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Teléfono *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div>
                  <label className="label">Género *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="label">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Tipo de Documento *</label>
                  <select
                    value={formData.idType}
                    onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="label">Número de Documento *</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="input"
                    placeholder="1234567890"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Dirección *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    placeholder="Calle 123 #45-67"
                  />
                </div>
              </div>
            </div>

            {/* Información Médica */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Información Médica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">EPS *</label>
                  <input
                    type="text"
                    value={formData.eps}
                    onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                    className="input"
                    placeholder="Ej: Sanitas, Sura, Compensar"
                  />
                </div>
                <div>
                  <label className="label">Tipo de Sangre *</label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Alergias</label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="input resize-none"
                    rows={2}
                    placeholder="Describe cualquier alergia o condición médica relevante"
                  />
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Contacto de Emergencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombre Completo *</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    className="input"
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <label className="label">Teléfono *</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="input"
                    placeholder="+57 300 123 4567"
                  />
                </div>
                <div>
                  <label className="label">Parentesco *</label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                    className="input"
                    placeholder="Ej: Padre, Madre, Hermano/a"
                  />
                </div>
              </div>
            </div>

            {/* Perfil Deportivo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Perfil Deportivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Posición *</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Armador">Armador</option>
                    <option value="Punta">Punta</option>
                    <option value="Opuesto">Opuesto</option>
                    <option value="Central">Central</option>
                    <option value="Líbero">Líbero</option>
                    <option value="Universal">Universal</option>
                  </select>
                </div>
                <div>
                  <label className="label">Nivel de Experiencia *</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Principiante">Principiante (0-1 años)</option>
                    <option value="Intermedio">Intermedio (1-3 años)</option>
                    <option value="Avanzado">Avanzado (3-5 años)</option>
                    <option value="Experto">Experto (5+ años)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Estatura (cm) *</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="input"
                    placeholder="180"
                    min="100"
                    max="250"
                  />
                </div>
                <div>
                  <label className="label">Peso (kg) *</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="input"
                    placeholder="75"
                    min="30"
                    max="200"
                  />
                </div>
                <div>
                  <label className="label">Talla de Camiseta *</label>
                  <select
                    value={formData.shirtSize}
                    onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div>
                  <label className="label">Talla de Pantalón *</label>
                  <select
                    value={formData.pantsSize}
                    onChange={(e) => setFormData({ ...formData, pantsSize: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
                <div>
                  <label className="label">Talla de Calzado *</label>
                  <input
                    type="number"
                    value={formData.shoeSize}
                    onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })}
                    className="input"
                    placeholder="42"
                    min="30"
                    max="50"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Información Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Ocupación *</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="input"
                    placeholder="Ej: Estudiante, Profesional, etc."
                  />
                </div>
                <div>
                  <label className="label">Nivel de Estudios *</label>
                  <select
                    value={formData.studyLevel}
                    onChange={(e) => setFormData({ ...formData, studyLevel: e.target.value })}
                    className="input"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Bachillerato">Bachillerato</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Tecnólogo">Tecnólogo</option>
                    <option value="Universitario">Universitario</option>
                    <option value="Posgrado">Posgrado</option>
                  </select>
                </div>
                <div>
                  <label className="label">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="input pl-10"
                      placeholder="@usuario"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchMemberData();
                }}
                className="btn btn-secondary flex-1"
                disabled={saving}
              >
                <X className="w-5 h-5" />
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={saving}
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Vista de Solo Lectura */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Teléfono" value={formData.phone} icon={<Phone className="w-4 h-4" />} />
                <InfoField label="Género" value={formData.gender} />
                <InfoField label="Fecha de Nacimiento" value={formData.dateOfBirth} icon={<Calendar className="w-4 h-4" />} />
                <InfoField label="Tipo de Documento" value={formData.idType} />
                <InfoField label="Número de Documento" value={formData.idNumber} />
                <InfoField label="Dirección" value={formData.address} icon={<MapPin className="w-4 h-4" />} className="md:col-span-2" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Información Médica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="EPS" value={formData.eps} />
                <InfoField label="Tipo de Sangre" value={formData.bloodType} />
                <InfoField label="Alergias" value={formData.allergies} className="md:col-span-2" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Contacto de Emergencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Nombre" value={formData.emergencyContactName} />
                <InfoField label="Teléfono" value={formData.emergencyContactPhone} />
                <InfoField label="Parentesco" value={formData.emergencyContactRelation} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Perfil Deportivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Posición" value={formData.position} />
                <InfoField label="Experiencia" value={formData.experience} />
                <InfoField label="Estatura" value={formData.height ? `${formData.height} cm` : ''} />
                <InfoField label="Peso" value={formData.weight ? `${formData.weight} kg` : ''} />
                <InfoField label="Talla Camiseta" value={formData.shirtSize} />
                <InfoField label="Talla Pantalón" value={formData.pantsSize} />
                <InfoField label="Talla Calzado" value={formData.shoeSize} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Información Adicional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Ocupación" value={formData.occupation} />
                <InfoField label="Nivel de Estudios" value={formData.studyLevel} />
                <InfoField label="Instagram" value={formData.instagram} icon={<Instagram className="w-4 h-4" />} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cambio de Contraseña */}
      <ChangePasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
    </div>
  );
}

function InfoField({ label, value, icon, className = '' }) {
  return (
    <div className={className}>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        <p className="text-gray-900 font-medium">
          {value || <span className="text-gray-400 italic">No especificado</span>}
        </p>
      </div>
    </div>
  );
}

export default MemberProfilePage;
