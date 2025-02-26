
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle2, Home, Users, Settings, CheckCircle, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    pendingAchievements: 0,
    totalFeedback: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch feedback
      const { data: feedbackData } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch pending achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select(`
          *,
          teacher_details(full_name, department)
        `)
        .eq('status', 'Pending Approval')
        .order('created_at', { ascending: false });

      // Fetch stats
      const { count: teacherCount } = await supabase
        .from('teacher_details')
        .select('*', { count: 'exact' });

      const { count: pendingCount } = await supabase
        .from('achievements')
        .select('*', { count: 'exact' })
        .eq('status', 'Pending Approval');

      const { count: feedbackCount } = await supabase
        .from('feedback')
        .select('*', { count: 'exact' });

      setFeedback(feedbackData || []);
      setAchievements(achievementsData || []);
      setStats({
        totalTeachers: teacherCount || 0,
        pendingAchievements: pendingCount || 0,
        totalFeedback: feedbackCount || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAchievementAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Achievement ${status.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      toast.error('Error updating achievement status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24">
      {/* Stats Section */}
      <div className="container mx-auto px-4">
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
                        By {achievement.teacher_details.full_name} ({achievement.teacher_details.department})
                      </p>
                      <p className="text-sm text-gray-600">Type: {achievement.achievement_type}</p>
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
                      <span className="text-sm text-gray-600">{item.identifier}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">From: {item.name}</p>
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
    </div>
  );
};

export default AdminDashboard;
