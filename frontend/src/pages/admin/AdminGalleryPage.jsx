import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Trash2, Eye, Filter, Search, UserPlus, Play, Film } from 'lucide-react';
import axios from '@/api/axios';

function AdminGalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'tournament',
    tags: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [taggedMemberIds, setTaggedMemberIds] = useState([]);
  const [taggedMemberObjects, setTaggedMemberObjects] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const searchTimeoutRef = useRef(null);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'tournament', name: 'Torneos' },
    { id: 'training', name: 'Entrenamientos' },
    { id: 'social', name: 'Social' },
    { id: 'facilities', name: 'Instalaciones' }
  ];

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  const fetchImages = async () => {
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await axios.get('/gallery', { params });
      setImages(response.data.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSearch = (query) => {
    setMemberSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) {
      setMemberSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchingMembers(true);
      try {
        const response = await axios.get('/admin/members', { params: { search: query, limit: 10 } });
        const results = (response.data.data || []).filter(
          m => !taggedMemberIds.includes(m._id)
        );
        setMemberSearchResults(results);
      } catch {
        setMemberSearchResults([]);
      } finally {
        setSearchingMembers(false);
      }
    }, 300);
  };

  const addTaggedMember = (member) => {
    if (taggedMemberIds.includes(member._id)) return;
    setTaggedMemberIds(prev => [...prev, member._id]);
    setTaggedMemberObjects(prev => [...prev, member]);
    setMemberSearchQuery('');
    setMemberSearchResults([]);
  };

  const removeTaggedMember = (memberId) => {
    setTaggedMemberIds(prev => prev.filter(id => id !== memberId));
    setTaggedMemberObjects(prev => prev.filter(m => m._id !== memberId));
  };

  const isVideoFile = (file) => file?.type?.startsWith('video/');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = isVideoFile(file) ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`El archivo es demasiado grande. Máximo ${isVideoFile(file) ? '50MB para videos' : '5MB para imágenes'}.`);
        return;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Por favor selecciona una imagen o video válido.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor selecciona una imagen');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      if (uploadData.tags) {
        const tagsArray = uploadData.tags.split(',').map(t => t.trim());
        tagsArray.forEach(tag => formData.append('tags[]', tag));
      }
      taggedMemberIds.forEach(id => formData.append('taggedMembers[]', id));

      await axios.post('/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Imagen subida exitosamente');
      setShowUploadModal(false);
      resetUploadForm();
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) {
      return;
    }

    try {
      await axios.delete(`/gallery/${id}`);
      alert('Imagen eliminada exitosamente');
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      description: '',
      category: 'tournament',
      tags: ''
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setTaggedMemberIds([]);
    setTaggedMemberObjects([]);
    setMemberSearchQuery('');
    setMemberSearchResults([]);
  };

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

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
            Galería de Fotos
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sube y gestiona las fotos del club</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Subir Fotos
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 border-l-4 border-primary-500">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Total</p>
          <p className="text-4xl font-display font-black text-primary-400">{images.length}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Imágenes</p>
        </div>
        {categories.slice(1).map((cat) => (
          <div key={cat.id} className="bg-slate-900 p-6 border-l-4 border-primary-500">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{cat.name}</p>
            <p className="text-4xl font-display font-black text-primary-400">
              {images.filter(img => img.category === cat.id).length}
            </p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide">Fotos</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 items-center flex-wrap">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 font-display font-bold uppercase tracking-wide text-sm transition-colors ${
              selectedCategory === cat.id
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm p-6 text-center py-16">
          <ImageIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">Sin Imágenes</h3>
          <p className="text-slate-400 text-sm uppercase tracking-wide mb-6">Sube tu primera imagen para comenzar</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Subir Imagen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-100 shadow-sm overflow-hidden group"
            >
              <div className="relative aspect-square bg-slate-900">
                {image.mediaType === 'video' ? (
                  <>
                    {image.thumbnailUrl ? (
                      <img src={image.thumbnailUrl} alt={image.title} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={image.imageUrl} alt={image.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => window.open(image.imageUrl, '_blank')}
                    className="p-2 bg-white hover:bg-slate-100 transition-colors"
                  >
                    <Eye className="w-5 h-5 text-slate-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="p-2 bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold uppercase text-slate-900 text-sm leading-tight mb-1 truncate">
                  {image.title}
                </h3>
                {image.description && (
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">{image.description}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-primary-50 text-primary-700">
                    {getCategoryName(image.category)}
                  </span>
                  {image.mediaType === 'video' && (
                    <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-purple-50 text-purple-700 flex items-center gap-1">
                      <Film className="w-3 h-3" /> Video
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
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
            onClick={() => !uploading && setShowUploadModal(false)}
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
                    Galería
                  </span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    Subir Imagen o Video
                  </h2>
                </div>
                <button
                  onClick={() => !uploading && setShowUploadModal(false)}
                  disabled={uploading}
                  className="p-2 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-5">
                {/* File Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Imagen o Video *
                  </label>
                  <div className="mt-1">
                    {previewUrl ? (
                      <div className="relative">
                        {isVideoFile(selectedFile) ? (
                          <video
                            src={previewUrl}
                            className="w-full h-64 object-cover bg-slate-900"
                            controls
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt="Vista previa"
                            className="w-full h-64 object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex gap-3 mb-3">
                          <Upload className="w-10 h-10 text-slate-300" />
                          <Film className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-1">
                          Haz clic para subir imagen o video
                        </p>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">PNG, JPG hasta 5MB · MP4, MOV hasta 50MB</p>
                        <input
                          type="file"
                          accept="image/*,video/mp4,video/mov,video/webm,video/avi"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    required
                    placeholder="Ej: Campeonato de Verano 2024"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white resize-none"
                    rows={3}
                    placeholder="Describe la imagen..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    required
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Etiquetas (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    placeholder="Ej: verano, playa, competencia"
                  />
                </div>

                {/* Tagged Members */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Etiquetar Miembros
                  </label>
                  <div className="relative">
                    <div className="flex items-center border-2 border-slate-200 focus-within:border-primary-500 transition-colors">
                      <Search className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
                      <input
                        type="text"
                        value={memberSearchQuery}
                        onChange={(e) => handleMemberSearch(e.target.value)}
                        className="flex-1 px-3 py-3 outline-none text-slate-900 bg-white"
                        placeholder="Buscar miembro por nombre..."
                      />
                      {searchingMembers && (
                        <div className="w-4 h-4 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mr-3" />
                      )}
                    </div>
                    {memberSearchResults.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border-2 border-slate-200 border-t-0 shadow-lg max-h-48 overflow-y-auto">
                        {memberSearchResults.map((member) => (
                          <button
                            key={member._id}
                            type="button"
                            onClick={() => addTaggedMember(member)}
                            className="w-full text-left px-4 py-2.5 hover:bg-primary-50 flex items-center gap-2 transition-colors"
                          >
                            <UserPlus className="w-4 h-4 text-primary-500 flex-shrink-0" />
                            <span className="text-sm text-slate-900">
                              {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                            </span>
                            <span className="text-xs text-slate-400 ml-auto">{member.memberNumber}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {taggedMemberObjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {taggedMemberObjects.map((member) => (
                        <span key={member._id} className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-bold px-3 py-1.5">
                          {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                          <button
                            type="button"
                            onClick={() => removeTaggedMember(member._id)}
                            className="hover:text-primary-900 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                    className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer flex-1 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {selectedFile && isVideoFile(selectedFile) ? 'Subir Video' : 'Subir Imagen'}
                      </>
                    )}
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

export default AdminGalleryPage;
