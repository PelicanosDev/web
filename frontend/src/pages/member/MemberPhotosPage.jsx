import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Heart, MessageCircle, Share2, Calendar, User } from 'lucide-react';
import axios from '@/api/axios';
import logo from '@/assets/images/Logo.png';

function MemberPhotosPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState(null);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const memberResponse = await axios.get('/members/me');
      const memberData = memberResponse.data.data;
      setMemberId(memberData._id);
      
      if (memberData._id) {
        fetchTaggedPhotos(memberData._id);
      }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Mis Fotos</h1>
        <p className="text-gray-600">Fotos donde has sido etiquetado</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : images.length === 0 ? (
        <div className="card text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay fotos aún</h3>
          <p className="text-gray-600">Aún no has sido etiquetado en ninguna foto</p>
        </div>
      ) : (
        <div className="space-y-6">
          {images.map((image, index) => (
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
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MemberPhotosPage;
