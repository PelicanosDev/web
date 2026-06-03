import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

function TreatmentModal() {
  const { needsTreatment, acceptTreatment } = useAuth();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    await acceptTreatment();
    setAccepting(false);
  };

  return (
    <AnimatePresence>
      {needsTreatment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-slate-900 px-6 py-5 border-l-4 border-primary-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-500 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-primary-400 text-xs font-bold uppercase tracking-widest">Privacidad</p>
                  <h2 className="font-display font-black uppercase text-white text-xl leading-none">
                    Tratamiento de Datos
                  </h2>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-primary-50 border-l-4 border-primary-500 px-4 py-3">
                <FileText className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-primary-800 font-medium">
                  Antes de continuar, necesitamos tu autorización para el tratamiento de tus datos personales según la Ley 1581 de 2012 (Colombia).
                </p>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <p className="font-bold text-slate-900 uppercase tracking-wide text-xs">Pelícanos Vóley Club</p>
                <p>
                  Al usar esta plataforma, autorizas a <strong>Pelícanos Vóley Club</strong> a recopilar, almacenar y procesar tus datos personales (nombre, correo, teléfono, fecha de nacimiento, información deportiva) para los siguientes fines:
                </p>
                <ul className="space-y-2 ml-4">
                  {[
                    'Gestión de tu membresía y perfil deportivo',
                    'Comunicaciones sobre eventos, torneos y actividades del club',
                    'Estadísticas y análisis de rendimiento deportivo',
                    'Publicación de fotos y contenido en la plataforma del club',
                    'Cumplimiento de obligaciones contractuales y legales',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="bg-slate-50 border border-slate-200 px-4 py-3 mt-4">
                  <p className="text-xs text-slate-500">
                    <strong>Tus derechos:</strong> Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos personales. Para ejercer estos derechos, contáctanos en la información del club. Los datos no serán vendidos ni cedidos a terceros sin tu consentimiento.
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  Al hacer clic en <strong>"Acepto y Continuar"</strong>, manifiestas que has leído, entendido y aceptas el tratamiento de tus datos personales conforme a lo descrito.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-6 py-3 hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {accepting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Acepto y Continuar
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                No puedes acceder a la plataforma sin aceptar el tratamiento de datos.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TreatmentModal;
