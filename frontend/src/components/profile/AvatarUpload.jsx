import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

function AvatarUpload({ currentAvatar, onAvatarUpdate, firstName = '', lastName = '' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('La imagen debe ser menor a 5MB'); return; }
      if (!file.type.startsWith('image/')) { alert('Solo se permiten archivos de imagen'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setPreview(reader.result); setShowModal(true); };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axios.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        onAvatarUpdate(response.data.data.avatar);
        setShowModal(false);
        setPreview(null);
        alert('Foto de perfil actualizada exitosamente');
      }
    } catch (error) {
      alert('Error al subir la foto: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="relative group flex-shrink-0">
        <div className="w-20 h-20 bg-primary-500 flex items-center justify-center overflow-hidden">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-black text-white text-2xl">
              {firstName?.[0]}{lastName?.[0]}
            </span>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 flex items-center justify-center text-white hover:bg-primary-600 transition-colors cursor-pointer"
          title="Cambiar foto"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-md w-full"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-0.5">Foto de Perfil</p>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    Previsualización
                  </h2>
                </div>
                <button onClick={handleCancel} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-center mb-6">
                  <div className="w-40 h-40 overflow-hidden border-4 border-primary-500">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>

                <p className="text-sm text-slate-500 text-center mb-6">
                  ¿Deseas usar esta imagen como tu foto de perfil?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={uploading}
                    className="flex-1 inline-flex items-center justify-center border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Subir Foto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default AvatarUpload;
