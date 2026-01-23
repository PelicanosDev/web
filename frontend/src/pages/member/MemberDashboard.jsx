import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Calendar, Users } from 'lucide-react';
import axios from '@/api/axios';

function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const [profileRes, statsRes, progressRes] = await Promise.all([
        axios.get('/member/profile'),
        axios.get('/member/stats'),
        axios.get('/member/progress'),
      ]);

      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
      setProgress(progressRes.data.data);
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const levelProgress = stats ? ((stats.xp % 500) / 500) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">ESTADO ACTUAL</p>
              <h2 className="text-3xl font-display font-bold mt-1">
                Nivel {stats?.level || 1}: Estrella en Ascenso ⭐
              </h2>
            </div>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>1,250 XP para Nivel 6</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
          </div>
          <Link to="/member/profile" className="text-sm hover:underline opacity-90">
            Ver Historial de XP →
          </Link>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Salto Vertical</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress?.verticalJump?.current || 0} cm
                </p>
                {progress?.verticalJump?.improvement > 0 && (
                  <p className="text-sm text-green-600">
                    +{progress.verticalJump.improvement} cm
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Serve Speed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress?.serveSpeed?.current || 0} km/h
                </p>
                {progress?.serveSpeed?.improvement > 0 && (
                  <p className="text-sm text-green-600">
                    +{progress.serveSpeed.improvement} km/h
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.attendanceRate || 0}%
                </p>
                <p className="text-sm text-gray-600">Great!</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalBadges || 0}
                </p>
                <p className="text-sm text-gray-600">Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Season Evolution</h2>
          <p className="text-sm text-gray-600 mb-4">Pre-Season vs Now</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Vertical Jump</span>
                <span className="font-semibold text-green-600">+7 cm</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 rounded-full h-2" style={{ width: '70%' }}></div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 rounded-full h-2" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>START: 45cm</span>
                <span>NOW: 52cm</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Serve Speed</span>
                <span className="font-semibold text-green-600">+12 km/h</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 rounded-full h-2" style={{ width: '60%' }}></div>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-500 rounded-full h-2" style={{ width: '90%' }}></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>START: 60</span>
                <span>NOW: 72</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Recent Matches</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div>
                <p className="font-semibold text-gray-900">OCT 24 - Regional Cup</p>
                <p className="text-sm text-gray-600">vs. Aguilas Club</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">3 - 1</p>
                <span className="text-xs font-semibold text-green-600">WIN</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div>
                <p className="font-semibold text-gray-900">OCT 18 - Friendly</p>
                <p className="text-sm text-gray-600">vs. Tiburones</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-600">2 - 3</p>
                <span className="text-xs font-semibold text-red-600">LOSS</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div>
                <p className="font-semibold text-gray-900">OCT 12 - League Opener</p>
                <p className="text-sm text-gray-600">vs. Rayos Club</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">3 - 0</p>
                <span className="text-xs font-semibold text-green-600">WIN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-primary-50 border-2 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
              Next Milestone
            </h3>
            <p className="text-gray-700 mb-4">
              Attend 5 more practice sessions to unlock the "Dedicated" badge.
            </p>
            <div className="w-full bg-white rounded-full h-3 mb-2">
              <div className="bg-primary-500 rounded-full h-3" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-600">3/5 Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
