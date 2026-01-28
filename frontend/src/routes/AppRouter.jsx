import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';

import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import MemberLayout from '@/components/layout/MemberLayout';

import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import VenuesPage from '@/pages/public/VenuesPage';
import GalleryPage from '@/pages/public/GalleryPage';
import ContactPage from '@/pages/public/ContactPage';
import TournamentDetailPage from '@/pages/public/TournamentDetailPage';
import MemberPublicProfilePage from '@/pages/public/MemberPublicProfilePage';
import LoginPage from '@/pages/auth/LoginPage';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import MembersPage from '@/pages/admin/MembersPage';
import MemberDetailPage from '@/pages/admin/MemberDetailPage';
import AdminGalleryPage from '@/pages/admin/AdminGalleryPage';
import AdminEventsPage from '@/pages/admin/AdminEventsPage';
import AdminTournamentsPage from '@/pages/admin/AdminTournamentsPage';
import AdminTournamentDetailPage from '@/pages/admin/AdminTournamentDetailPage';
import BadgesPage from '@/pages/admin/BadgesPage';

import MemberDashboard from '@/pages/member/MemberDashboard';
import MemberProfilePage from '@/pages/member/MemberProfilePage';
import MemberTournamentsPage from '@/pages/member/MemberTournamentsPage';
import MemberPhotosPage from '@/pages/member/MemberPhotosPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/venues" element={<VenuesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
        <Route path="/members/:id" element={<MemberPublicProfilePage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'coach']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="members/:id" element={<MemberDetailPage />} />
        <Route path="gallery" element={<AdminGalleryPage />} />
        <Route path="events" element={<AdminEventsPage />} />
        <Route path="tournaments" element={<AdminTournamentsPage />} />
        <Route path="tournaments/:id" element={<AdminTournamentDetailPage />} />
        <Route path="badges" element={<BadgesPage />} />
      </Route>

      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['member']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberDashboard />} />
        <Route path="profile" element={<MemberProfilePage />} />
        <Route path="tournaments" element={<MemberTournamentsPage />} />
        <Route path="photos" element={<MemberPhotosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
