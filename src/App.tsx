
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Teacher from "./pages/Teacher";
import Admin from "./pages/Admin";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherAchievements from "./pages/teacher/TeacherAchievements";
import TeacherDetails from "./pages/teacher/TeacherDetails";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />}>
            <Route index element={<TeacherProfile />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="achievements" element={<TeacherAchievements />} />
            <Route path="details" element={<TeacherDetails />} />
          </Route>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
