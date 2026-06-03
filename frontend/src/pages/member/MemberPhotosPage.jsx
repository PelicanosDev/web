import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Image as ImageIcon, Heart, MessageCircle, Share2, Calendar, User, Upload, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';
import logo from '@/assets/images/Logo.png';

function MemberPhotosPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', category: 'social' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const memberResponse = await axios.get('/members/me');
      const memberData = memberResponse.data.data;
      setMemberId(memberData._id);
      if (memberData._id) fetchTaggedPhotos(memberData._id);
    } catch (error) {
      console.error('Error fetching member data:', error);
      setLoading(false);
    }
  };

  const fetchTaggedPhotos = async (id) => {
    try {
      const response = await axios.get(`/gallery/member/${id}/tagged`);
      setImages(response.data.data);
    } catch (error) {
      console.error('Error fetching tagged photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Por favor selecciona una imagen o video válido.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('title', uploadData.title || 'Foto de miembro');
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);

      await axios.post('/gallery/member-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadData({ title: '', description: '', category: 'social' });
      if (memberId) fetchTaggedPhotos(memberId);
      alert('¡Foto subida exitosamente!');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir la foto: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setShowUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadData({ title: '', description: '', category: 'social' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
            Galería Personal
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
            Mis Fotos
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Fotos donde has sido etiquetado y tus publicaciones</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Subir Foto
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm p-6 text-center py-12">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">No hay fotos aún</h3>
          <p className="text-slate-500 mb-4">Aún no has sido etiquetado en ninguna foto</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Subir tu primera foto
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {images.map((image) => (
            <article
              key={image._id}
              className="bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 flex items-center gap-3">
                <img src={logo} alt="Pelícanos Volley Club" className="w-12 h-12 object-cover border-2 border-primary-200" />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Pelícanos Volley Club</h3>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>{new Date(image.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    {image.eventId && (
                      <>
                        <span>·</span>
                        <Calendar className="w-3 h-3" />
                        <span className="text-primary-600">{image.eventId.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {image.title && (
                  <div className="px-4 pb-3">
                    <h4 className="font-bold text-slate-900 text-base uppercase tracking-wide">{image.title}</h4>
                    {image.description && <p className="text-slate-600 mt-1 text-sm">{image.description}</p>}
                  </div>
                )}
                <div className="relative bg-black cursor-pointer" onClick={() => setSelectedImage(image)}>
                  <img src={image.imageUrl} alt={image.title} className="w-full max-h-[600px] object-contain mx-auto" />
                </div>
              </div>

              {image.taggedMembers && image.taggedMembers.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Con</span>
                    {image.taggedMembers.slice(0, 3).map((member, idx) => (
                      <Link key={member._id} to={`/members/${member._id}`} className="text-sm font-bold text-primary-600 hover:underline">
                        {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                        {idx < Math.min(2, image.taggedMembers.length - 1) && ','}
                      </Link>
                    ))}
                    {image.taggedMembers.length > 3 && <span className="text-sm text-slate-500">y {image.taggedMembers.length - 3} más</span>}
                  </div>
                </div>
              )}

              <div className="px-4 py-3 border-t border-slate-100">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wide">{image.likes?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wide">{image.comments?.length || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" onClick={() => setSelectedImage(null)}>
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.imageUrl} alt={selectedImage.title} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeUploadModal}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-2 py-1 mb-1">Galería</span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">Subir Foto</h2>
                </div>
                <button onClick={closeUploadModal} disabled={uploading} className="p-2 hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-5">
                {/* File selector */}
                <div
                  className="border-2 border-dashed border-slate-300 hover:border-primary-400 transition-colors cursor-pointer p-6 text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="max-h-48 mx-auto object-contain" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Selecciona una imagen o video</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF, MP4 · Máximo 10MB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Título</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="Ej: Entrenamiento del sábado"
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descripción</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    rows={2}
                    placeholder="Descripción opcional..."
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Categoría</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                  >
                    <option value="social">Social</option>
                    <option value="training">Entrenamiento</option>
                    <option value="tournament">Torneo</option>
                    <option value="facilities">Instalaciones</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeUploadModal} disabled={uploading} className="flex-1 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all disabled:opacity-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={!selectedFile || uploading} className="flex-1 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploading ? 'Subiendo...' : 'Publicar'}
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

export default MemberPhotosPage;
