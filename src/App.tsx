
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// Layouts
const Admin = lazy(() => import("@/pages/Admin"));
const Teacher = lazy(() => import("@/pages/Teacher"));

// Home / Auth
const Index = lazy(() => import("@/pages/Index"));
const AuthPage = lazy(() => import("@/components/AuthPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminAuth = lazy(() => import("@/pages/AdminAuth"));
const FeedbackForm = lazy(() => import("@/components/FeedbackForm"));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminTeachers = lazy(() => import("@/pages/admin/AdminTeachers"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminFeedback = lazy(() => import("@/pages/admin/AdminFeedback"));

// Teacher Pages
const TeacherHome = lazy(() => import("@/pages/teacher/TeacherHome"));
const TeacherAchievements = lazy(() => import("@/pages/teacher/TeacherAchievements"));
const TeacherDetails = lazy(() => import("@/pages/teacher/TeacherDetails"));
const TeacherProfile = lazy(() => import("@/pages/teacher/TeacherProfile"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/teacher-auth" element={<AuthPage role="teacher" />} />
          <Route path="/admin-auth" element={<AdminAuth />} />

          {/* Admin Routes */}
          <Route path="/admin-dashboard" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="feedback" element={<AdminFeedback />} />
          </Route>

          {/* Teacher Routes */}
          <Route path="/teacher-dashboard" element={<Teacher />}>
            <Route index element={<TeacherHome />} />
            <Route path="achievements" element={<TeacherAchievements />} />
            <Route path="details" element={<TeacherDetails />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
      <SonnerToaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
