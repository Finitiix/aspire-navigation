import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { LogOut, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

export const TeacherNavbar = () => {
  const navigate = useNavigate();
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [currentPoints, setCurrentPoints] = useState(0);

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
        
        // Fetch current points
        const { data: pointsData } = await supabase
          .from('teacher_points')
          .select('current_points')
          .eq('teacher_id', user.id)
          .single();
        
        setCurrentPoints(pointsData?.current_points || 0);
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

  return (
    <div className="h-20 pt-4 px-4">
      <Card className="fixed top-4 left-4 right-4 z-50 rounded-lg shadow-md bg-primary">
        <div className="container mx-auto px-6">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {teacherDetails?.profile_pic_url ? (
                <img
                  src={teacherDetails.profile_pic_url}
                  alt="Profile"
                  className="w-12 h-12 rounded-full bg-white"
                />
              ) : (
                <UserCircle2 className="w-12 h-12 text-white" />
              )}
              <div>
                <p className="text-lg font-medium text-white">{teacherDetails?.full_name}</p>
                <p className="text-sm text-white/80">
                  {teacherDetails?.eid} | {teacherDetails?.designation}
                </p>
              </div>
              <div className="flex items-center gap-4 text-white/90">
                <div className="text-center">
                  <p className="text-xs text-white/70">Achieve Score</p>
                  <p className="text-lg font-bold">{currentPoints}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ChangePasswordDialog />
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-white"
                onClick={handleSignOut}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
