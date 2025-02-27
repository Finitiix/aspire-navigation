
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalFeedback: 0,
    pendingApprovals: 0
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [messages, setMessages] = useState({
    important: '',
    details: ''
  });

  useEffect(() => {
    fetchData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch statistics
      const [teachersData, feedbackData, approvalsData] = await Promise.all([
        supabase.from('teacher_details').select('*', { count: 'exact' }),
        supabase.from('feedback').select('*', { count: 'exact' }),
        supabase.from('achievements').select('*').eq('status', 'Pending Approval')
      ]);

      setStats({
        totalTeachers: teachersData.count || 0,
        totalFeedback: feedbackData.count || 0,
        pendingApprovals: (approvalsData.data?.length || 0)
      });

      // Fetch pending achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select(`
          *,
          teacher_details(full_name, department)
        `)
        .eq('status', 'Pending Approval');

      setAchievements(achievementsData || []);

      // Fetch recent feedback
      const { data: feedbackData2 } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setFeedback(feedbackData2 || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
          <h3 className="text-lg font-medium mb-2">Total Feedback</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalFeedback}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-primary">{stats.pendingApprovals}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievements Approval */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Pending Achievements</h3>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">
                        By {achievement.teacher_details?.full_name} ({achievement.teacher_details?.department})
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {achievement.achievement_type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600"
                        onClick={() => handleAchievementAction(achievement.id, 'Approved')}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => handleAchievementAction(achievement.id, 'Rejected')}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {achievements.length === 0 && (
                <p className="text-gray-600 text-center">No pending achievements</p>
              )}
            </div>
          </Card>

          {/* Messages Section */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Important Messages</h3>
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="Important announcement..."
                  value={messages.important}
                  onChange={(e) => setMessages({ ...messages, important: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Additional details..."
                  value={messages.details}
                  onChange={(e) => setMessages({ ...messages, details: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setMessages({ important: '', details: '' })}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button>Save Messages</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Feedback Messages */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Recent Feedback</h3>
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{item.subject}</h4>
                  <span className="text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  From: {item.name} ({item.identifier})
                </p>
                <p className="text-gray-700">{item.message}</p>
              </Card>
            ))}
            {feedback.length === 0 && (
              <p className="text-gray-600 text-center">No feedback messages</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
