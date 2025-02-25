
import { Outlet } from "react-router-dom";
import { TeacherNavbar } from "@/components/teacher/TeacherNavbar";
import { TeacherBottomNav } from "@/components/teacher/TeacherBottomNav";

const TeacherDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <TeacherNavbar />
      <Outlet />
      <TeacherBottomNav />
    </div>
  );
};

export default TeacherDashboard;
