import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Heart, MessageCircle, Share2, Calendar, MapPin } from 'lucide-react';
import axios from '@/api/axios';
import logo from '@/assets/images/Logo.png';

function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'tournament', name: 'Torneos' },
    { id: 'training', name: 'Entrenamientos' },
    { id: 'social', name: 'Social' },
    { id: 'facilities', name: 'Instalaciones' },
  ];

  useEffect(() => {
    fetchImages();
  }, [filter]);

  const fetchImages = async () => {
    try {
      const params = filter !== 'all' ? { category: filter, isPublic: true } : { isPublic: true };
      const response = await axios.get('/gallery', { params });
      setImages(response.data.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images;

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="py-12 bg-gradient-to-br from-ocean-500 to-primary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-display font-bold mb-4"
          >
            Feed de Pelícanos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/90"
          >
            Mantente al día con nuestros torneos, entrenamientos y eventos
          </motion.p>
        </div>
      </section>

      <section className="py-6 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  filter === category.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-600 text-lg">No hay publicaciones en esta categoría</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredImages.map((image, index) => (
                <motion.article
                  key={image._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center gap-3">
                    <img
                      src={logo}
                      alt="Pelícanos Volley Club"
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">Pelícanos Volley Club</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{new Date(image.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        {image.eventId && (
                          <>
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            <span className="text-primary-600">{image.eventId.title}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div>
                    {image.title && (
                      <div className="px-4 pb-3">
                        <h4 className="font-semibold text-gray-900 text-lg">{image.title}</h4>
                        {image.description && (
                          <p className="text-gray-600 mt-1">{image.description}</p>
                        )}
                      </div>
                    )}
                    
                    <div 
                      className="relative bg-black cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-full max-h-[600px] object-contain mx-auto"
                      />
                    </div>
                  </div>

                  {/* Tagged Members */}
                  {image.taggedMembers && image.taggedMembers.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Con</span>
                        {image.taggedMembers.slice(0, 3).map((member, idx) => (
                          <Link
                            key={member._id}
                            to={`/members/${member._id}`}
                            className="text-sm font-semibold text-primary-600 hover:underline"
                          >
                            {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                            {idx < Math.min(2, image.taggedMembers.length - 1) && ','}
                          </Link>
                        ))}
                        {image.taggedMembers.length > 3 && (
                          <span className="text-sm text-gray-600">
                            y {image.taggedMembers.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">Me gusta</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Comentar</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors ml-auto">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-auto object-contain rounded-lg"
              />
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <h3 className="text-xl font-bold text-white mb-2">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-white/80 mb-3">{selectedImage.description}</p>
                )}
                {selectedImage.taggedMembers && selectedImage.taggedMembers.length > 0 && (
                  <div>
                    <p className="text-white/70 text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Miembros etiquetados:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedImage.taggedMembers.map((member) => (
                        <Link
                          key={member._id}
                          to={`/members/${member._id}`}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {member.userId?.profile?.avatar ? (
                            <img
                              src={member.userId.profile.avatar}
                              alt={`${member.userId.profile.firstName} ${member.userId.profile.lastName}`}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                              {member.userId?.profile?.firstName?.charAt(0)}{member.userId?.profile?.lastName?.charAt(0)}
                            </div>
                          )}
                          <span className="text-white text-sm">
                            {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GalleryPage;
