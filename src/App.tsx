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
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminPoints from "./pages/admin/AdminPoints";
import { FeedbackForm } from "./components/FeedbackForm";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import PublicTeacherProfile from "./pages/PublicTeacherProfile";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteGuard>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/teacher" element={<Teacher />} />
              <Route path="admin-auth" element={<AdminAuth />} />
              <Route path="feedback" element={<FeedbackForm />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/teacher/:id" element={<PublicTeacherProfile />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />}>
                <Route index element={<TeacherHome />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="achievements" element={<TeacherAchievements />} />
                <Route path="details" element={<TeacherDetails />} />
              </Route>
              <Route path="/admin-dashboard" element={<Admin />}>
                <Route index element={<AdminDashboard />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="feedback" element={<AdminFeedback />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="departments" element={<AdminDepartments />} />
                <Route path="points" element={<AdminPoints />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteGuard>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
