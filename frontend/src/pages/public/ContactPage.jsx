import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

const contactItems = [
  {
    icon: MapPin,
    label: 'Ubicación',
    value: 'Bosque Popular El Prado, Av. Alberto Mendoza, Manizales',
  },
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+57 311 305 7249',
    href: 'tel:+573113057249',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'pelicanosvoleyclub@gmail.com',
    href: 'mailto:pelicanosvoleyclub@gmail.com',
  },
  {
    icon: Clock,
    label: 'Horario de Entrenamientos',
    value: 'Lunes, Miércoles y Viernes',
  },
];

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSubmitted(false), 6000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {/* ── HEADER ── */}
      <section className="relative bg-slate-900 py-28 overflow-hidden">
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
            Hablemos
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black uppercase text-white leading-none text-5xl md:text-7xl"
          >
            Contáctanos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xl mt-6 max-w-xl"
          >
            Ponte en contacto para conocer más sobre membresías, entrenamientos o torneos.
          </motion.p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Membership card */}
              <div className="bg-slate-900 border-l-4 border-primary-500 p-8 text-white">
                <p className="text-primary-400 text-xs font-bold uppercase tracking-widest mb-4">
                  Membresía Mensual
                </p>
                <div className="font-display font-black text-6xl text-primary-400 leading-none">
                  $150K
                </div>
                <div className="font-bold text-white text-lg mt-1 mb-3">COP / mes</div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Acceso ilimitado a todas las canchas, sesiones de entrenamiento y eventos del club.
                </p>
              </div>

              {/* Contact details */}
              <div className="bg-slate-50 p-8 space-y-6">
                {contactItems.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary-500 flex-shrink-0 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                        {label}
                      </p>
                      {href ? (
                        <a
                          href={href}
                          className="text-slate-900 font-semibold hover:text-primary-500 transition-colors break-all"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-slate-900 font-semibold">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="border border-slate-200 p-8 md:p-10">
                <h2
                  className="font-display font-black uppercase text-slate-900 leading-none mb-8"
                  style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}
                >
                  Envíanos un <span className="text-primary-500">Mensaje</span>
                </h2>

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border-l-4 border-green-500 p-4 mb-6"
                    role="alert"
                    aria-live="polite"
                  >
                    <p className="text-green-800 font-semibold">
                      ¡Gracias por tu mensaje! Te responderemos pronto.
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
                      >
                        Nombre *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        placeholder="Tu nombre completo"
                        className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
                      >
                        Correo *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        placeholder="tu@correo.com"
                        className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      placeholder="+57 300 123 4567"
                      className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
                    >
                      Mensaje *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      className="w-full px-4 py-3.5 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                    Enviar Mensaje
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
