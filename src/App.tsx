
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Teacher from "./pages/Teacher";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherHome from "./pages/teacher/TeacherHome";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherAchievements from "./pages/teacher/TeacherAchievements";
import TeacherDetails from "./pages/teacher/TeacherDetails";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminSettings from "./pages/admin/AdminSettings";
import { FeedbackForm } from "./components/FeedbackForm";

const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && location.pathname.includes('admin-dashboard')) {
        navigate('/admin-auth');
      }
    };
    checkAuth();
  }, [navigate, location]);

  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RouteGuard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teacher" element={<Teacher />} />
            <Route path="/admin-auth" element={<AdminAuth />} />
            <Route path="/feedback" element={<FeedbackForm />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />}>
              <Route index element={<TeacherHome />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="achievements" element={<TeacherAchievements />} />
              <Route path="details" element={<TeacherDetails />} />
            </Route>
            <Route path="/admin-dashboard" element={<Admin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<AdminTeachers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouteGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
