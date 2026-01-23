import { useEffect, useState } from 'react';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from '@/api/axios';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyRevenue: 0,
    memberGrowth: '+0%',
  });
  const [growthData, setGrowthData] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
    {
      title: 'Total Miembros',
      value: stats.totalMembers,
      change: stats.memberGrowth,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Jugadores Activos',
      value: stats.activeMembers,
      change: '+5%',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      title: 'Ingresos Mensuales',
      value: `$${(stats.monthlyRevenue / 1000).toFixed(0)}K`,
      change: '+8%',
      icon: DollarSign,
      color: 'bg-primary-500',
    },
    {
      title: 'Tasa de Crecimiento',
      value: stats.memberGrowth,
      change: '+12%',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900">Bienvenido de nuevo, Admin</h1>
        <p className="text-gray-600">Esto es lo que está pasando en el club hoy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm font-semibold ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
            Membership Growth
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            New member registrations over the last 6 months
          </p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New Members</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs font-semibold text-primary-500">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-primary-500">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.time}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{event.participants} participants</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-6">
          Recent Registrations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Member</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.length > 0 ? (
                recentMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="font-semibold text-primary-500">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-700">{member.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        member.status === 'active' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-primary-500 hover:underline text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No recent registrations
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
