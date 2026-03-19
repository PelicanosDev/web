import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from '@/api/axios';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, monthlyRevenue: 0, memberGrowth: '+0%' });
  const [growthData, setGrowthData] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, growthRes, membersRes, eventsRes] = await Promise.all([
        axios.get('/admin/dashboard/stats'),
        axios.get('/admin/dashboard/growth'),
        axios.get('/admin/dashboard/recent'),
        axios.get('/admin/dashboard/events'),
      ]);
      setStats(statsRes.data.data);
      setGrowthData(growthRes.data.data);
      setRecentMembers(membersRes.data.data);
      setUpcomingEvents(eventsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Miembros', value: stats.totalMembers, change: stats.memberGrowth, icon: Users, dark: true },
    { title: 'Jugadores Activos', value: stats.activeMembers, change: '+5%', icon: Activity, dark: false },
    { title: 'Ingresos Mensuales', value: `$${(stats.monthlyRevenue / 1000).toFixed(0)}K`, change: '+8%', icon: DollarSign, dark: true },
    { title: 'Tasa de Crecimiento', value: stats.memberGrowth, change: '+12%', icon: TrendingUp, dark: false },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
          Panel de Control
        </span>
        <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
          Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Resumen de actividad del club</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ title, value, change, icon: Icon, dark }) => (
          <div
            key={title}
            className={`p-6 border-l-4 border-primary-500 ${dark ? 'bg-slate-900' : 'bg-white border border-slate-100 shadow-sm'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-primary-500 flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {change}
              </span>
            </div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              {title}
            </p>
            <p className={`font-display font-black text-3xl leading-none ${dark ? 'text-primary-400' : 'text-slate-900'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Crecimiento</p>
          <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-1">
            Nuevos Miembros
          </h2>
          <p className="text-sm text-slate-500 mb-6">Inscripciones de los últimos 6 meses</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ border: '1px solid #e2e8f0', borderRadius: 0, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Agenda</p>
          <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-6">
            Próximos Eventos
          </h2>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-900 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-primary-400 uppercase leading-none">
                      {new Date(event.date).toLocaleDateString('es-ES', { month: 'short' })}
                    </span>
                    <span className="font-display font-black text-white text-lg leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{event.title}</p>
                    <p className="text-xs text-slate-500">{event.time}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{event.participants} participantes</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Sin eventos próximos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Members table */}
      <div className="bg-white border border-slate-100 shadow-sm p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Actividad</p>
        <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-6">
          Últimas Inscripciones
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Miembro</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Rol</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.length > 0 ? (
                recentMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-500 flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-bold text-white text-sm">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                          <p className="text-xs text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-600 font-medium capitalize">{member.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {member.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/members/${member.id}`}
                        className="text-primary-500 hover:text-primary-700 text-sm font-bold uppercase tracking-wide transition-colors"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-slate-400 text-sm">
                    Sin inscripciones recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
