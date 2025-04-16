
import {
  Home,
  Book,
  Calendar,
  ListChecks,
  Users,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TeacherNavbarProps {
  department?: string | null;
}

export const TeacherNavbar = ({ department }: TeacherNavbarProps) => {
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("teacher_details")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data) {
            setTeacherDetails(data);
          }
        }
      } catch (error) {
        console.error("Error fetching teacher details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 border-b border-gray-200 bg-white z-50 px-4 sm:px-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Navigation links */}
          <div className="flex items-center space-x-4">
            <NavLink
              to="/teacher-dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/teacher-dashboard/achievements"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Book className="w-4 h-4" />
              <span>Achievements</span>
            </NavLink>
            <NavLink
              to="/teacher-dashboard/tasks"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <ListChecks className="w-4 h-4" />
              <span>Tasks</span>
            </NavLink>
            <NavLink
              to="/teacher-dashboard/events"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </NavLink>
            <NavLink
              to="/teacher-dashboard/teacher-details"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200 ${isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Users className="w-4 h-4" />
              <span>Teachers</span>
            </NavLink>
          </div>

          {/* Right side: User avatar and dropdown */}
          <div>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 lg:h-10 lg:w-10 rounded-full">
                    <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                      <AvatarImage src={teacherDetails?.profile_pic_url || "/placeholder.svg"} alt={teacherDetails?.full_name || "Profile"} />
                      <AvatarFallback>{teacherDetails?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
