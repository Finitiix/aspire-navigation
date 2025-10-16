
import { Home, Award, FileText, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const TeacherBottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-around">
          <Link
            to="/teacher-dashboard"
            className={`flex flex-col items-center ${
              isActive("/teacher-dashboard") ? "text-primary" : "text-gray-600"
            }`}
          >
            <Home className="w-7 h-7" />
            <span className="text-sm mt-1">Home</span>
          </Link>
          <Link
            to="/teacher-dashboard/achievements"
            className={`flex flex-col items-center ${
              isActive("/teacher-dashboard/achievements") ? "text-primary" : "text-gray-600"
            }`}
          >
            <Award className="w-7 h-7" />
            <span className="text-sm mt-1">Achievements</span>
          </Link>
          <Link
            to="/teacher-dashboard/details"
            className={`flex flex-col items-center ${
              isActive("/teacher-dashboard/details") ? "text-primary" : "text-gray-600"
            }`}
          >
            <FileText className="w-7 h-7" />
            <span className="text-sm mt-1">Details</span>
          </Link>
          <Link
            to="/teacher-dashboard/profile"
            className={`flex flex-col items-center ${
              isActive("/teacher-dashboard/profile") ? "text-primary" : "text-gray-600"
            }`}
          >
            <User className="w-7 h-7" />
            <span className="text-sm mt-1">Profile</span>
          </Link>
        </div>
        <div className="text-center py-2 border-t">
          <p className="text-xs text-gray-500">
            From{" "}
            <a 
              href="https://finitix.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Finitix
            </a>
          </p>
        </div>
      </div>
    </nav>
  );
};
