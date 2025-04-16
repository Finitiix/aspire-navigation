
import { useEffect, useState } from "react";
import { TeacherDetailsForm } from "@/components/teacher/TeacherDetailsForm";
import { TeacherNavbar } from "@/components/teacher/TeacherNavbar";
import { TeacherBottomNav } from "@/components/teacher/TeacherBottomNav";
import { AuthPage } from "@/components/AuthPage";
import { supabase } from "@/integrations/supabase/client";

const Teacher = () => {
  const [session, setSession] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [teacherDepartment, setTeacherDepartment] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkTeacherDetails(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkTeacherDetails(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkTeacherDetails = async (userId: string) => {
    const { data } = await supabase
      .from('teacher_details')
      .select('id, department')
      .eq('id', userId)
      .single();
    
    if (data) {
      setTeacherDepartment(data.department);
      setIsNewUser(false);
    } else {
      setIsNewUser(true);
    }
  };

  if (!session) {
    return <AuthPage role="teacher" />;
  }

  if (isNewUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TeacherDetailsForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-16">
      <TeacherNavbar department={teacherDepartment} />
      {/* Content will be added here based on routes */}
      <TeacherBottomNav />
    </div>
  );
};

export default Teacher;
