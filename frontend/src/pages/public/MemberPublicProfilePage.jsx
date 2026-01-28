import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Trophy, Award, TrendingUp, Heart, MessageCircle, Share2, Calendar, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';
import logo from '@/assets/images/Logo.png';

function MemberPublicProfilePage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [taggedPhotos, setTaggedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchMemberProfile();
    fetchTaggedPhotos();
  }, [id]);

  const fetchMemberProfile = async () => {
    try {
      const response = await axios.get(`/members/${id}`);
      setMember(response.data.data);
    } catch (error) {
      console.error('Error fetching member profile:', error);
      setError('No se pudo cargar el perfil del miembro');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaggedPhotos = async () => {
    try {
      const response = await axios.get(`/gallery/member/${id}/tagged`);
      setTaggedPhotos(response.data.data);
    } catch (error) {
      console.error('Error fetching tagged photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil no encontrado</h2>
          <p className="text-gray-600 mb-4">{error || 'Este perfil no está disponible'}</p>
          <Link to="/gallery" className="btn btn-primary">
            Volver a la Galería
          </Link>
        </div>
      </div>
    );
  }

  const firstName = member.userId?.profile?.firstName || '';
  const lastName = member.userId?.profile?.lastName || '';
  const avatar = member.userId?.profile?.avatar;
  const position = member.sportProfile?.position || 'No especificado';
  const experience = member.sportProfile?.experience || 'No especificado';
  const badges = member.gamification?.badges || [];
  const level = member.gamification?.level || 1;
  const xp = member.gamification?.xp || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-600 to-ocean-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/gallery" className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5" />
            Volver a la Galería
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            {avatar ? (
              <img
                src={avatar}
                alt={`${firstName} ${lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-xl">
                <span className="text-5xl font-bold text-white">
                  {firstName.charAt(0)}{lastName.charAt(0)}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold mb-2">
                {firstName} {lastName}
              </h1>
              <p className="text-xl text-white/90 mb-2">{position}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Trophy className="w-5 h-5" />
                  <span className="font-semibold">Nivel {level}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">{badges.length} Insignias</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card text-center"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{position}</p>
            <p className="text-sm text-gray-600">Posición</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">Nivel {level}</p>
            <p className="text-sm text-gray-600">{xp} XP</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card text-center"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{badges.length}</p>
            <p className="text-sm text-gray-600">Insignias</p>
          </motion.div>
        </div>

        {/* Feed de Publicaciones */}
        <div className="mt-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary-500" />
            Publicaciones
          </h2>
          
          {loadingPhotos ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : taggedPhotos.length === 0 ? (
            <div className="card text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin publicaciones</h3>
              <p className="text-gray-600">Este miembro aún no ha sido etiquetado en ninguna publicación</p>
            </div>
          ) : (
            <div className="space-y-6">
              {taggedPhotos.map((image, index) => (
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

        {/* Modal de imagen */}
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
                <ArrowLeft className="w-6 h-6 rotate-180" />
              </button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MemberPublicProfilePage;
