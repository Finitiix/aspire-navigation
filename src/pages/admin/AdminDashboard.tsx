
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2, Home, Users, Settings, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    pendingAchievements: 0,
    totalFeedback: 0
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats
      const [teachersData, achievementsData, feedbackData] = await Promise.all([
        supabase.from('teacher_details').select('*', { count: 'exact' }),
        supabase.from('achievements').select('*').eq('status', 'Pending Approval'),
        supabase.from('feedback').select('*', { count: 'exact' })
      ]);

      setStats({
        totalTeachers: teachersData.count || 0,
        pendingAchievements: achievementsData.data?.length || 0,
        totalFeedback: feedbackData.count || 0
      });

      // Fetch pending achievements with teacher details
      const { data: achievementsWithTeachers } = await supabase
        .from('achievements')
        .select(`
          *,
          teacher_details(full_name, department)
        `)
        .eq('status', 'Pending Approval');

      setAchievements(achievementsWithTeachers || []);

      // Fetch feedback
      const { data: feedbackMessages } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      setFeedback(feedbackMessages || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading dashboard data');
    }
  };

  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'achievements' },
        () => fetchData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'feedback' },
        () => fetchData()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'teacher_details' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAchievementAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Achievement ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating achievement status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Teachers</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalTeachers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-primary">{stats.pendingAchievements}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Feedback</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalFeedback}</p>
        </Card>
      </div>

      {/* Pending Achievements */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Pending Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">
                      By {achievement.teacher_details?.full_name} ({achievement.teacher_details?.department})
                    </p>
                    <p className="text-sm text-gray-600">Type: {achievement.achievement_type}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(achievement.date_achieved).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => handleAchievementAction(achievement.id, 'Approved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => handleAchievementAction(achievement.id, 'Rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {achievements.length === 0 && (
              <p className="text-gray-600 text-center py-4">No pending achievements</p>
            )}
          </div>
        </div>
      </Card>

      {/* Feedback Messages */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id} className="p-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{item.subject}</h3>
                    <span className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    From: {item.name} ({item.identifier})
                  </p>
                  <p className="text-gray-700">{item.message}</p>
                </div>
              </Card>
            ))}
            {feedback.length === 0 && (
              <p className="text-gray-600 text-center py-4">No feedback messages</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
