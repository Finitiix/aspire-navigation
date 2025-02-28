
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Award, User, Menu } from "lucide-react";
import { Button } from "../ui/button";

export const TeacherBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    return path === route;
  };

  const activeClasses = "bg-red-100 text-red-500";
  const inactiveClasses = "text-gray-500 hover:text-red-500 hover:bg-gray-100";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
      <div className="container mx-auto flex justify-around items-center">
        <Button
          variant="ghost"
          size="lg"
          className={`flex flex-col items-center rounded-full p-2 ${
            isActive("/teacher-dashboard") ? activeClasses : inactiveClasses
          } transition-all duration-200`}
          onClick={() => navigate("/teacher-dashboard")}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs">Home</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className={`flex flex-col items-center rounded-full p-2 ${
            isActive("/teacher-dashboard/details") ? activeClasses : inactiveClasses
          } transition-all duration-200`}
          onClick={() => navigate("/teacher-dashboard/details")}
        >
          <BookOpen className="w-6 h-6 mb-1" />
          <span className="text-xs">Faculty</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className={`flex flex-col items-center rounded-full p-2 ${
            isActive("/teacher-dashboard/achievements") ? activeClasses : inactiveClasses
          } transition-all duration-200`}
          onClick={() => navigate("/teacher-dashboard/achievements")}
        >
          <Award className="w-6 h-6 mb-1" />
          <span className="text-xs">Achievements</span>
        </Button>

        <Button
          variant="ghost"
          size="lg"
          className={`flex flex-col items-center rounded-full p-2 ${
            isActive("/teacher-dashboard/profile") ? activeClasses : inactiveClasses
          } transition-all duration-200`}
          onClick={() => navigate("/teacher-dashboard/profile")}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">Profile</span>
        </Button>
      </div>
    </div>
  );
};
