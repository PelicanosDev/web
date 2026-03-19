import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Heart, MessageCircle, Share2, Calendar, ImageOff } from 'lucide-react';
import axios from '@/api/axios';
import logo from '@/assets/images/Logo.png';

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'tournament', name: 'Torneos' },
  { id: 'training', name: 'Entrenamientos' },
  { id: 'social', name: 'Social' },
  { id: 'facilities', name: 'Instalaciones' },
];

function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [filter]);

  const fetchImages = async () => {
    setLoading(true);
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

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── HEADER ── */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
        <div
          className="absolute -right-24 top-1/2 -translate-y-1/2 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block bg-primary-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6"
          >
            Comunidad
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black uppercase text-white leading-none text-5xl md:text-6xl"
          >
            Feed de<br />
            <span className="text-primary-400">Pelícanos</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg mt-5 max-w-lg"
          >
            Mantente al día con nuestros torneos, entrenamientos y eventos.
          </motion.p>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-5 py-2 font-display font-bold text-sm uppercase tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  filter === cat.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEED ── */}
      <section className="py-10">
        <div className="max-w-2xl mx-auto px-4">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white shadow-sm overflow-hidden animate-pulse">
                  <div className="flex items-center gap-3 p-4 border-b border-slate-50">
                    <div className="w-11 h-11 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-200 rounded w-2/5" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-72 bg-slate-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="bg-white border border-slate-200 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <ImageOff className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-display font-black uppercase text-slate-700 text-xl mb-2">
                Sin publicaciones
              </h3>
              <p className="text-slate-500 text-sm">
                No hay publicaciones en esta categoría todavía.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {images.map((image, index) => (
                <motion.article
                  key={image._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Post header */}
                  <div className="p-4 flex items-center gap-3 border-b border-slate-50">
                    <img
                      src={logo}
                      alt="Pelícanos Volley Club"
                      className="w-11 h-11 rounded-full object-cover border-2 border-primary-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">Pelícanos Volley Club</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                        <span>
                          {new Date(image.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {image.eventId && (
                          <>
                            <span>·</span>
                            <Calendar className="w-3 h-3" />
                            <span className="text-primary-500 font-semibold truncate">
                              {image.eventId.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & description */}
                  {image.title && (
                    <div className="px-4 pt-3 pb-2">
                      <h4 className="font-display font-bold text-slate-900 text-base">
                        {image.title}
                      </h4>
                      {image.description && (
                        <p className="text-slate-500 text-sm mt-1">{image.description}</p>
                      )}
                    </div>
                  )}

                  {/* Image */}
                  <button
                    className="relative bg-black w-full block cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`Ampliar imagen${image.title ? `: ${image.title}` : ''}`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title || 'Foto de Pelícanos Vóley Club'}
                      className="w-full max-h-[520px] object-contain mx-auto hover:opacity-95 transition-opacity"
                      loading="lazy"
                    />
                  </button>

                  {/* Tagged members */}
                  {image.taggedMembers?.length > 0 && (
                    <div className="px-4 py-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-500">Con</span>
                        {image.taggedMembers.slice(0, 3).map((member, idx) => (
                          <Link
                            key={member._id}
                            to={`/members/${member._id}`}
                            className="font-bold text-primary-500 hover:text-primary-600 hover:underline transition-colors"
                          >
                            {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                            {idx < Math.min(2, image.taggedMembers.length - 1) && ','}
                          </Link>
                        ))}
                        {image.taggedMembers.length > 3 && (
                          <span className="text-slate-500">
                            y {image.taggedMembers.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-6">
                    <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors text-sm font-medium cursor-pointer">
                      <Heart className="w-5 h-5" />
                      <span>Me gusta</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors text-sm font-medium cursor-pointer">
                      <MessageCircle className="w-5 h-5" />
                      <span>Comentar</span>
                    </button>
                    <button
                      className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors ml-auto cursor-pointer"
                      aria-label="Compartir"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              onClick={() => setSelectedImage(null)}
              aria-label="Cerrar imagen"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <motion.img
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={selectedImage.imageUrl}
                alt={selectedImage.title || 'Foto de Pelícanos Vóley Club'}
                className="w-full h-auto object-contain"
              />

              {(selectedImage.title || selectedImage.taggedMembers?.length > 0) && (
                <div className="mt-3 bg-white/10 backdrop-blur-sm p-4">
                  {selectedImage.title && (
                    <h3 className="font-display font-bold text-white text-lg mb-1">
                      {selectedImage.title}
                    </h3>
                  )}
                  {selectedImage.description && (
                    <p className="text-white/70 text-sm mb-3">{selectedImage.description}</p>
                  )}
                  {selectedImage.taggedMembers?.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-white/60 text-sm">Con</span>
                      {selectedImage.taggedMembers.map((member) => (
                        <Link
                          key={member._id}
                          to={`/members/${member._id}`}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {member.userId?.profile?.avatar ? (
                            <img
                              src={member.userId.profile.avatar}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                              {member.userId?.profile?.firstName?.charAt(0)}
                              {member.userId?.profile?.lastName?.charAt(0)}
                            </div>
                          )}
                          <span className="text-white text-sm">
                            {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GalleryPage;
