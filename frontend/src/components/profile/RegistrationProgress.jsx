import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

function RegistrationProgress({ member }) {
  const requiredFields = [
    { key: 'phone', label: 'Teléfono', value: member.userId?.profile?.phone },
    { key: 'gender', label: 'Género', value: member.userId?.profile?.gender },
    { key: 'dateOfBirth', label: 'Fecha de Nacimiento', value: member.userId?.profile?.dateOfBirth },
    { key: 'idType', label: 'Tipo de Documento', value: member.userId?.profile?.idType },
    { key: 'idNumber', label: 'Número de Documento', value: member.userId?.profile?.idNumber },
    { key: 'address', label: 'Dirección', value: member.userId?.profile?.address },
    { key: 'eps', label: 'EPS', value: member.medicalInfo?.eps },
    { key: 'bloodType', label: 'Tipo de Sangre', value: member.medicalInfo?.bloodType },
    { key: 'allergies', label: 'Alergias', value: member.medicalInfo?.allergies },
    { key: 'emergencyName', label: 'Nombre Contacto Emergencia', value: member.emergencyContact?.name },
    { key: 'emergencyPhone', label: 'Teléfono Emergencia', value: member.emergencyContact?.phone },
    { key: 'emergencyRelation', label: 'Parentesco', value: member.emergencyContact?.relation },
    { key: 'position', label: 'Posición', value: member.sportProfile?.position },
    { key: 'experience', label: 'Experiencia', value: member.sportProfile?.experience },
    { key: 'height', label: 'Estatura', value: member.sportProfile?.height },
    { key: 'weight', label: 'Peso', value: member.sportProfile?.weight },
    { key: 'shirtSize', label: 'Talla Camiseta', value: member.sportProfile?.shirtSize },
    { key: 'pantsSize', label: 'Talla Pantalón', value: member.sportProfile?.pantsSize },
    { key: 'shoeSize', label: 'Talla Calzado', value: member.sportProfile?.shoeSize },
    { key: 'occupation', label: 'Ocupación', value: member.additionalInfo?.occupation },
    { key: 'studyLevel', label: 'Nivel de Estudios', value: member.additionalInfo?.studyLevel },
    { key: 'instagram', label: 'Instagram', value: member.socialMedia?.instagram },
  ];

  const completedFields = requiredFields.filter(field => field.value).length;
  const totalFields = requiredFields.length;
  const progress = Math.round((completedFields / totalFields) * 100);
  const isComplete = progress === 100;

  const barColor = progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const chipColor = progress === 100
    ? 'bg-green-100 text-green-700'
    : progress >= 50
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';

  return (
    <div className="bg-white border border-slate-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className={`p-2 ${chipColor}`}>
            {isComplete
              ? <CheckCircle className="w-5 h-5" />
              : <AlertCircle className="w-5 h-5" />}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Progreso de Inscripción</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {completedFields} de {totalFields} campos completados
            </p>
          </div>
        </div>
        <div className="font-display font-black text-3xl text-slate-900 leading-none">{progress}%</div>
      </div>

      <div className="w-full bg-slate-100 h-2 mb-4">
        <div
          className={`h-2 transition-all duration-500 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {!isComplete && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Campos pendientes:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {requiredFields.map((field) => (
              <div key={field.key} className="flex items-center gap-2 text-sm">
                {field.value ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
                <span className={field.value ? 'text-slate-400 line-through' : 'text-slate-700'}>
                  {field.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-green-800 font-bold uppercase tracking-widest text-xs">
            Perfil completo — Todos los datos de inscripción han sido registrados
          </p>
        </div>
      )}
    </div>
  );
}

export default RegistrationProgress;
