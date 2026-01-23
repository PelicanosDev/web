import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Trash2, Edit, Eye, Filter } from 'lucide-react';
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida.');
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
      formData.append('image', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      if (uploadData.tags) {
        const tagsArray = uploadData.tags.split(',').map(t => t.trim());
        tagsArray.forEach(tag => formData.append('tags[]', tag));
      }

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
  };

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Gestión de Galería</h1>
          <p className="text-gray-600">Sube y gestiona las fotos del club</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary"
        >
          <Upload className="w-5 h-5" />
          Subir Fotos
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Imágenes</p>
              <p className="text-2xl font-bold text-gray-900">{images.length}</p>
            </div>
          </div>
        </div>

        {categories.slice(1).map((cat) => (
          <div key={cat.id} className="card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{cat.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {images.filter(img => img.category === cat.id).length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="card text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay imágenes</h3>
          <p className="text-gray-600 mb-4">Sube tu primera imagen para comenzar</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Upload className="w-5 h-5" />
            Subir Imagen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <motion.div
              key={image._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-0 overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(image.imageUrl, '_blank')}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100"
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(image._id)}
                    className="p-2 bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {getCategoryName(image.category)}
                </span>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    Subir Nueva Imagen
                  </h2>
                  <button
                    onClick={() => !uploading && setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    disabled={uploading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-6">
                {/* File Upload */}
                <div>
                  <label className="label">Imagen *</label>
                  <div className="mt-2">
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-600 mb-1">Haz clic para subir una imagen</p>
                        <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="label">Título *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="input"
                    required
                    placeholder="Ej: Campeonato de Verano 2024"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="label">Descripción</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="input resize-none"
                    rows={3}
                    placeholder="Describe la imagen..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="label">Categoría *</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="input"
                    required
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="label">Etiquetas (separadas por comas)</label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                    className="input"
                    placeholder="Ej: verano, playa, competencia"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="btn btn-secondary flex-1"
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={uploading || !selectedFile}
                  >
                    {uploading ? 'Subiendo...' : 'Subir Imagen'}
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
