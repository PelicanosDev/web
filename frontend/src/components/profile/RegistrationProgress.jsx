import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

function RegistrationProgress({ member }) {
  // Calcular campos completados según formulario de Google
  const requiredFields = [
    // Datos personales
    { key: 'phone', label: 'Teléfono', value: member.userId?.profile?.phone },
    { key: 'gender', label: 'Género', value: member.userId?.profile?.gender },
    { key: 'dateOfBirth', label: 'Fecha de Nacimiento', value: member.userId?.profile?.dateOfBirth },
    { key: 'idType', label: 'Tipo de Documento', value: member.userId?.profile?.idType },
    { key: 'idNumber', label: 'Número de Documento', value: member.userId?.profile?.idNumber },
    { key: 'address', label: 'Dirección', value: member.userId?.profile?.address },
    { key: 'eps', label: 'EPS', value: member.medicalInfo?.eps },
    { key: 'bloodType', label: 'Tipo de Sangre', value: member.medicalInfo?.bloodType },
    { key: 'allergies', label: 'Alergias', value: member.medicalInfo?.allergies },
    
    // Contacto de emergencia
    { key: 'emergencyName', label: 'Nombre Contacto Emergencia', value: member.emergencyContact?.name },
    { key: 'emergencyPhone', label: 'Teléfono Emergencia', value: member.emergencyContact?.phone },
    { key: 'emergencyRelation', label: 'Parentesco', value: member.emergencyContact?.relation },
    
    // Perfil deportivo
    { key: 'position', label: 'Posición', value: member.sportProfile?.position },
    { key: 'experience', label: 'Experiencia', value: member.sportProfile?.experience },
    { key: 'height', label: 'Estatura', value: member.sportProfile?.height },
    { key: 'weight', label: 'Peso', value: member.sportProfile?.weight },
    { key: 'shirtSize', label: 'Talla Camiseta', value: member.sportProfile?.shirtSize },
    { key: 'pantsSize', label: 'Talla Pantalón', value: member.sportProfile?.pantsSize },
    { key: 'shoeSize', label: 'Talla Calzado', value: member.sportProfile?.shoeSize },
    
    // Información adicional
    { key: 'occupation', label: 'Ocupación', value: member.additionalInfo?.occupation },
    { key: 'studyLevel', label: 'Nivel de Estudios', value: member.additionalInfo?.studyLevel },
    { key: 'instagram', label: 'Instagram', value: member.socialMedia?.instagram },
  ];

  const completedFields = requiredFields.filter(field => field.value).length;
  const totalFields = requiredFields.length;
  const progress = Math.round((completedFields / totalFields) * 100);
  const isComplete = progress === 100;

  const getStatusColor = () => {
    if (progress === 100) return 'text-green-600 bg-green-100';
    if (progress >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = () => {
    if (progress === 100) return <CheckCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Progreso de Inscripción</h3>
            <p className="text-sm text-gray-600">
              {completedFields} de {totalFields} campos completados
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{progress}%</div>
          {isComplete && (
            <span className="text-xs text-green-600 font-medium">✓ Completo</span>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${
            progress === 100 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Lista de campos */}
      {!isComplete && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">Campos pendientes:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {requiredFields.map((field) => (
              <div key={field.key} className="flex items-center gap-2 text-sm">
                {field.value ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                <span className={field.value ? 'text-gray-600 line-through' : 'text-gray-900'}>
                  {field.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">
            ¡Perfil completo! Todos los datos de inscripción han sido registrados.
          </p>
        </div>
      )}
    </div>
  );
}

export default RegistrationProgress;
