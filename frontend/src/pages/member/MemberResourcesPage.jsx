import { useState, useEffect } from 'react';
import axios from '@/api/axios';
import { BookOpen, FileText, Video, ExternalLink, Download } from 'lucide-react';

const CATEGORY_LABELS = {
  policy: 'Política de Datos',
  regulation: 'Reglamento',
  form: 'Formulario',
  announcement: 'Comunicado',
  home_workout: 'Rutina en Casa',
  technique: 'Técnica',
  warmup: 'Calentamiento',
  other: 'Otro',
};

function isYouTube(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}

function DocumentCard({ resource }) {
  return (
    <div className="bg-white border border-slate-200 p-5 flex items-start gap-4">
      <div className="w-10 h-10 bg-blue-100 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 text-sm">{resource.title}</p>
        {resource.description && (
          <p className="text-xs text-slate-500 mt-1">{resource.description}</p>
        )}
        <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5">
          {CATEGORY_LABELS[resource.category] || resource.category}
        </span>
      </div>
      {resource.fileUrl && (
        <a
          href={resource.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-slate-700 transition-colors flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Ver / Descargar
        </a>
      )}
    </div>
  );
}

function VideoCard({ resource }) {
  const hasYoutube = isYouTube(resource.videoUrl);
  const hasFileVideo = resource.fileUrl && !resource.fileUrl.match(/\.(pdf|doc|docx)$/i);

  return (
    <div className="bg-white border border-slate-200 overflow-hidden">
      {hasFileVideo && (
        <video controls className="w-full max-h-64 bg-black">
          <source src={resource.fileUrl} />
          Tu navegador no soporta el elemento de video.
        </video>
      )}
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Video className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm">{resource.title}</p>
          {resource.description && (
            <p className="text-xs text-slate-500 mt-1">{resource.description}</p>
          )}
          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-purple-50 text-purple-700 px-2 py-0.5">
            {CATEGORY_LABELS[resource.category] || resource.category}
          </span>
        </div>
        {hasYoutube && (
          <a
            href={resource.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-red-700 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver en YouTube
          </a>
        )}
        {!hasYoutube && resource.videoUrl && (
          <a
            href={resource.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 text-xs font-bold uppercase tracking-wide hover:bg-slate-700 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver video
          </a>
        )}
      </div>
    </div>
  );
}

export default function MemberResourcesPage() {
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [docsRes, vidsRes] = await Promise.all([
          axios.get('/resources?type=document'),
          axios.get('/resources?type=video'),
        ]);
        setDocuments(docsRes.data.data);
        setVideos(vidsRes.data.data);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-500 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl uppercase tracking-wide text-slate-900">Recursos</h1>
          <p className="text-xs text-slate-500">Documentos y videos del club</p>
        </div>
      </div>

      {/* Documents Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-blue-600" />
          <h2 className="font-display font-bold uppercase tracking-wide text-slate-700 text-sm">
            Documentos Importantes
          </h2>
          <span className="text-xs text-slate-400 font-bold">{documents.length}</span>
        </div>
        {documents.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sin documentos disponibles</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => <DocumentCard key={doc._id} resource={doc} />)}
          </div>
        )}
      </section>

      {/* Videos Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-4 h-4 text-purple-600" />
          <h2 className="font-display font-bold uppercase tracking-wide text-slate-700 text-sm">
            Videos de Entrenamiento
          </h2>
          <span className="text-xs text-slate-400 font-bold">{videos.length}</span>
        </div>
        {videos.length === 0 ? (
          <div className="text-center py-10 bg-white border border-slate-200">
            <Video className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sin videos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((vid) => <VideoCard key={vid._id} resource={vid} />)}
          </div>
        )}
      </section>
    </div>
  );
}
