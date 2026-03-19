import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      {/* Page Header */}
      <div>
        <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
          Galería Personal
        </span>
        <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
          Mis Fotos
        </h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Fotos donde has sido etiquetado</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm p-6 text-center py-12">
          <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">No hay fotos aún</h3>
          <p className="text-slate-500">Aún no has sido etiquetado en ninguna foto</p>
        </div>
      ) : (
        <div className="space-y-6">
          {images.map((image) => (
            <article
              key={image._id}
              className="bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <img
                  src={logo}
                  alt="Pelícanos Volley Club"
                  className="w-12 h-12 object-cover border-2 border-primary-200"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">Pelícanos Volley Club</h3>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>
                      {new Date(image.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
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

              {/* Post Content */}
              <div>
                {image.title && (
                  <div className="px-4 pb-3">
                    <h4 className="font-bold text-slate-900 text-base uppercase tracking-wide">{image.title}</h4>
                    {image.description && (
                      <p className="text-slate-600 mt-1 text-sm">{image.description}</p>
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

              {/* Miembros Etiquetados */}
              {image.taggedMembers && image.taggedMembers.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Con</span>
                    {image.taggedMembers.slice(0, 3).map((member, idx) => (
                      <Link
                        key={member._id}
                        to={`/members/${member._id}`}
                        className="text-sm font-bold text-primary-600 hover:underline"
                      >
                        {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                        {idx < Math.min(2, image.taggedMembers.length - 1) && ','}
                      </Link>
                    ))}
                    {image.taggedMembers.length > 3 && (
                      <span className="text-sm text-slate-500">
                        y {image.taggedMembers.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="px-4 py-3 border-t border-slate-100">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wide">Me gusta</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wide">Comentar</span>
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
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberPhotosPage;
