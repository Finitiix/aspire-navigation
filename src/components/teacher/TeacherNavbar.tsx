
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { LogOut, Key, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

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

  return (
    <Card className="fixed top-0 left-0 right-0 z-50 rounded-b-lg shadow-md">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {teacherDetails?.profile_pic_url ? (
              <img
                src={teacherDetails.profile_pic_url}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <UserCircle2 className="w-10 h-10" />
            )}
            <div>
              <p className="font-medium">{teacherDetails?.full_name}</p>
              <p className="text-sm text-gray-600">
                {teacherDetails?.eid} | {teacherDetails?.designation}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => navigate("/change-password")}
            >
              <Key className="w-4 h-4" />
              Change Password
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
