
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { LogOut, UserCircle2, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TeacherNavbar = () => {
  const navigate = useNavigate();
  const [teacherDetails, setTeacherDetails] = useState<any>(null);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('teacher_details')
          .select('*')
          .eq('id', user.id)
          .single();
        setTeacherDetails(data);
      }
    };

    fetchTeacherDetails();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const goToProfile = () => {
    navigate("/teacher/profile");
  };

  return (
    <div className="h-20 pt-4 px-4 animate-fadeIn">
      <Card className="fixed top-4 left-4 right-4 z-50 rounded-lg shadow-md bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg transition-all duration-300">
        <div className="container mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="cursor-pointer hover:opacity-90 transition-opacity">
                    {teacherDetails?.profile_pic_url ? (
                      <img
                        src={teacherDetails.profile_pic_url}
                        alt="Profile"
                        className="w-12 h-12 rounded-full bg-white"
                      />
                    ) : (
                      <UserCircle2 className="w-12 h-12 text-white" />
                    )}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={goToProfile}>
                    Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <div className="flex items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <div className="flex items-center text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div>
                <p className="text-lg font-medium text-white">{teacherDetails?.full_name}</p>
                <p className="text-sm text-white/80">
                  {teacherDetails?.eid} | {teacherDetails?.designation}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ChangePasswordDialog />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
