import { useState, useEffect } from 'react';
import { User, Phone, Calendar, MapPin, AlertTriangle, Activity, Edit2, Save, X, Heart, Briefcase, Instagram, Lock } from 'lucide-react';
import axios from '@/api/axios';
import { useAuth } from '@/features/auth/context/AuthContext';
import RegistrationProgress from '@/components/profile/RegistrationProgress';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import AvatarUpload from '@/components/profile/AvatarUpload';

const inputCls = 'w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white';
const labelCls = 'block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2';

function MemberProfilePage() {
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    phone: '', gender: '', dateOfBirth: '', idType: '', idNumber: '', address: '',
    eps: '', bloodType: '', allergies: '',
    emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    position: '', experience: '', height: '', weight: '', shirtSize: '', pantsSize: '', shoeSize: '',
    occupation: '', studyLevel: '', instagram: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMemberData(); }, []);

  const handleAvatarUpdate = async (newAvatarUrl) => {
    try {
      await fetchMemberData();
    } catch (error) {
      setMember(prev => prev ? { ...prev, userId: { ...prev.userId, profile: { ...prev.userId.profile, avatar: newAvatarUrl } } } : null);
    }
  };

  const fetchMemberData = async () => {
    try {
      const response = await axios.get('/member/profile');
      setMember(response.data.data);
      const m = response.data.data;
      setFormData({
        phone: m.userId?.profile?.phone || '',
        gender: m.userId?.profile?.gender || '',
        dateOfBirth: m.userId?.profile?.dateOfBirth?.split('T')[0] || '',
        idType: m.userId?.profile?.idType || '',
        idNumber: m.userId?.profile?.idNumber || '',
        address: m.userId?.profile?.address || '',
        eps: m.medicalInfo?.eps || '',
        bloodType: m.medicalInfo?.bloodType || '',
        allergies: m.medicalInfo?.allergies || '',
        emergencyContactName: m.emergencyContact?.name || '',
        emergencyContactPhone: m.emergencyContact?.phone || '',
        emergencyContactRelation: m.emergencyContact?.relation || '',
        position: m.sportProfile?.position || '',
        experience: m.sportProfile?.experience || '',
        height: m.sportProfile?.height || '',
        weight: m.sportProfile?.weight || '',
        shirtSize: m.sportProfile?.shirtSize || '',
        pantsSize: m.sportProfile?.pantsSize || '',
        shoeSize: m.sportProfile?.shoeSize || '',
        occupation: m.additionalInfo?.occupation || '',
        studyLevel: m.additionalInfo?.studyLevel || '',
        instagram: m.socialMedia?.instagram || ''
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
      await axios.put('/member/profile', formData);
      alert('Perfil actualizado exitosamente');
      setEditing(false);
      fetchMemberData();
    } catch (error) {
      alert('Error al actualizar el perfil: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !member) {
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
            Miembro
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
            Mi Perfil
          </h1>
          <p className="text-slate-500 mt-1">Completa tu información de inscripción</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            Editar Perfil
          </button>
        )}
      </div>

      {/* Progreso de Inscripción */}
      {member && <RegistrationProgress member={member} />}

      {/* Información del Usuario */}
      <div className="bg-white border border-slate-100 shadow-sm p-6">
        {/* Avatar & name */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <AvatarUpload
            currentAvatar={member?.userId?.profile?.avatar}
            onAvatarUpdate={handleAvatarUpdate}
            firstName={member?.userId?.profile?.firstName}
            lastName={member?.userId?.profile?.lastName}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-black uppercase text-slate-900 text-2xl leading-tight">
              {member?.userId?.profile?.firstName} {member?.userId?.profile?.lastName}
            </h2>
            <p className="text-slate-500 text-sm truncate">{member?.userId?.email}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Miembro #{member?.memberNumber}</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-4 py-2 hover:border-slate-400 transition-all cursor-pointer text-sm flex-shrink-0"
          >
            <Lock className="w-4 h-4" />
            Cambiar Contraseña
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Datos Personales */}
            <Section icon={<User className="w-4 h-4" />} title="Datos Personales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Teléfono *</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputCls} placeholder="+57 300 123 4567" />
                </div>
                <div>
                  <label className={labelCls}>Género *</label>
                  <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Fecha de Nacimiento *</label>
                  <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tipo de Documento *</label>
                  <select value={formData.idType} onChange={(e) => setFormData({ ...formData, idType: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Número de Documento *</label>
                  <input type="text" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} className={inputCls} placeholder="1234567890" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Dirección *</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputCls} placeholder="Calle 123 #45-67" />
                </div>
              </div>
            </Section>

            {/* Información Médica */}
            <Section icon={<Heart className="w-4 h-4" />} title="Información Médica">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>EPS *</label>
                  <input type="text" value={formData.eps} onChange={(e) => setFormData({ ...formData, eps: e.target.value })} className={inputCls} placeholder="Ej: Sanitas, Sura" />
                </div>
                <div>
                  <label className={labelCls}>Tipo de Sangre *</label>
                  <select value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Alergias</label>
                  <textarea value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} className={`${inputCls} resize-none`} rows={2} placeholder="Describe cualquier alergia o condición médica relevante" />
                </div>
              </div>
            </Section>

            {/* Contacto de Emergencia */}
            <Section icon={<AlertTriangle className="w-4 h-4" />} title="Contacto de Emergencia">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre Completo *</label>
                  <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })} className={inputCls} placeholder="Nombre del contacto" />
                </div>
                <div>
                  <label className={labelCls}>Teléfono *</label>
                  <input type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })} className={inputCls} placeholder="+57 300 123 4567" />
                </div>
                <div>
                  <label className={labelCls}>Parentesco *</label>
                  <input type="text" value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })} className={inputCls} placeholder="Ej: Padre, Madre, Hermano/a" />
                </div>
              </div>
            </Section>

            {/* Perfil Deportivo */}
            <Section icon={<Activity className="w-4 h-4" />} title="Perfil Deportivo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Posición *</label>
                  <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {['Armador','Punta','Opuesto','Central','Líbero','Universal'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Nivel de Experiencia *</label>
                  <select value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    <option value="Principiante">Principiante (0-1 años)</option>
                    <option value="Intermedio">Intermedio (1-3 años)</option>
                    <option value="Avanzado">Avanzado (3-5 años)</option>
                    <option value="Experto">Experto (5+ años)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estatura (cm) *</label>
                  <input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className={inputCls} placeholder="180" min="100" max="250" />
                </div>
                <div>
                  <label className={labelCls}>Peso (kg) *</label>
                  <input type="number" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className={inputCls} placeholder="75" min="30" max="200" />
                </div>
                <div>
                  <label className={labelCls}>Talla de Camiseta *</label>
                  <select value={formData.shirtSize} onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Talla de Pantalón *</label>
                  <select value={formData.pantsSize} onChange={(e) => setFormData({ ...formData, pantsSize: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Talla de Calzado *</label>
                  <input type="number" value={formData.shoeSize} onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })} className={inputCls} placeholder="42" min="30" max="50" step="0.5" />
                </div>
              </div>
            </Section>

            {/* Información Adicional */}
            <Section icon={<Briefcase className="w-4 h-4" />} title="Información Adicional">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ocupación *</label>
                  <input type="text" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className={inputCls} placeholder="Ej: Estudiante, Profesional" />
                </div>
                <div>
                  <label className={labelCls}>Nivel de Estudios *</label>
                  <select value={formData.studyLevel} onChange={(e) => setFormData({ ...formData, studyLevel: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {['Bachillerato','Técnico','Tecnólogo','Universitario','Posgrado'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className={`${inputCls} pl-10`} placeholder="@usuario" />
                  </div>
                </div>
              </div>
            </Section>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setEditing(false); fetchMemberData(); }}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <ReadSection icon={<User className="w-4 h-4" />} title="Datos Personales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Teléfono" value={formData.phone} />
                <InfoField label="Género" value={formData.gender} />
                <InfoField label="Fecha de Nacimiento" value={formData.dateOfBirth} />
                <InfoField label="Tipo de Documento" value={formData.idType} />
                <InfoField label="Número de Documento" value={formData.idNumber} />
                <InfoField label="Dirección" value={formData.address} className="sm:col-span-2" />
              </div>
            </ReadSection>

            <ReadSection icon={<Heart className="w-4 h-4" />} title="Información Médica">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="EPS" value={formData.eps} />
                <InfoField label="Tipo de Sangre" value={formData.bloodType} />
                <InfoField label="Alergias" value={formData.allergies} className="sm:col-span-2" />
              </div>
            </ReadSection>

            <ReadSection icon={<AlertTriangle className="w-4 h-4" />} title="Contacto de Emergencia">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Nombre" value={formData.emergencyContactName} />
                <InfoField label="Teléfono" value={formData.emergencyContactPhone} />
                <InfoField label="Parentesco" value={formData.emergencyContactRelation} />
              </div>
            </ReadSection>

            <ReadSection icon={<Activity className="w-4 h-4" />} title="Perfil Deportivo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Posición" value={formData.position} />
                <InfoField label="Experiencia" value={formData.experience} />
                <InfoField label="Estatura" value={formData.height ? `${formData.height} cm` : ''} />
                <InfoField label="Peso" value={formData.weight ? `${formData.weight} kg` : ''} />
                <InfoField label="Talla Camiseta" value={formData.shirtSize} />
                <InfoField label="Talla Pantalón" value={formData.pantsSize} />
                <InfoField label="Talla Calzado" value={formData.shoeSize} />
              </div>
            </ReadSection>

            <ReadSection icon={<Briefcase className="w-4 h-4" />} title="Información Adicional">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField label="Ocupación" value={formData.occupation} />
                <InfoField label="Nivel de Estudios" value={formData.studyLevel} />
                <InfoField label="Instagram" value={formData.instagram} />
              </div>
            </ReadSection>
          </div>
        )}
      </div>

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-400">{icon}</span>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</p>
      </div>
      {children}
    </div>
  );
}

function ReadSection({ icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <span className="text-primary-500">{icon}</span>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
      </div>
      {children}
    </div>
  );
}

function InfoField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-slate-900 font-medium">
        {value || <span className="text-slate-300 italic font-normal">No especificado</span>}
      </p>
    </div>
  );
}

export default MemberProfilePage;
