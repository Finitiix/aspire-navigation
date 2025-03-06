
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Award, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AchievementForm } from "@/components/teacher/AchievementForm";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type RecentAchievement = {
  id: string;
  title: string;
  category: string;
  date_achieved: string;
  status: string;
  rejection_reason?: string;
}

const TeacherHome = () => {
  const [messages, setMessages] = useState({
    important_messages: [],
    important_details: [],
  });

  const [isAchievementFormOpen, setIsAchievementFormOpen] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [showTimetable, setShowTimetable] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);

  useEffect(() => {
    fetchMessages();
    fetchTeacherDetails();
    fetchRecentAchievements();
  }, []);

  // Fetch important messages and details from the admin section
  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase.from("important_messages").select("*");
      const { data: detailsData, error: detailsError } = await supabase.from("important_details").select("*");

      if (error || detailsError) {
        console.error("Error fetching messages:", error || detailsError);
        return;
      }

      setMessages({
        important_messages: messagesData || [],
        important_details: detailsData || [],
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch teacher details
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
    }
  };

  // Fetch recent achievements
  const fetchRecentAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("detailed_achievements")
          .select("id, title, category, date_achieved, status, rejection_reason")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching recent achievements:", error);
          return;
        }

        setRecentAchievements(data || []);
      }
    } catch (error) {
      console.error("Error fetching recent achievements:", error);
    }
  };

  // Get status badge color based on achievement status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Get status icon based on achievement status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Important Messages Section - With shadow and hover effect */}
        <Card className="h-80 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-red-100 p-1.5 rounded-full">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              Important Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 overflow-y-auto">
            {messages.important_messages.length > 0 ? (
              messages.important_messages.map((msg: any, index) => (
                <div key={index} className="flex items-start gap-3 mb-4 leading-relaxed">
                  <div className="min-w-6 text-gray-500">•</div>
                  <p className="text-gray-700 leading-relaxed">{msg.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No important messages</p>
            )}
          </CardContent>
        </Card>

        {/* Add Achievement Button & Important Details - Ensuring same height */}
        <div className="flex flex-col gap-6">
          <Dialog open={isAchievementFormOpen} onOpenChange={setIsAchievementFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-32 bg-[#ea384c] hover:bg-red-700 text-white font-bold rounded-lg text-lg">
                <Award className="w-6 h-6 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Achievement</DialogTitle>
              </DialogHeader>
              <AchievementForm onSuccess={() => setIsAchievementFormOpen(false)} />
            </DialogContent>
          </Dialog>

          {/* Important Details Section - With exact same height as the message section minus achievement button */}
          <Card className="h-48 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-red-100 p-1.5 rounded-full">
                  <Clock className="w-5 h-5 text-red-500" />
                </div>
                Important Details
              </CardTitle>
            </CardHeader>
            <CardContent className="h-32 overflow-y-auto">
              {messages.important_details.length > 0 ? (
                messages.important_details.map((detail: any, index) => (
                  <div key={index} className="flex items-start gap-3 mb-4 leading-relaxed">
                    <div className="min-w-6 text-gray-500">•</div>
                    <p className="text-gray-700 leading-relaxed">{detail.detail}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No important details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Achievements Section */}
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-red-100 p-1.5 rounded-full">
              <Award className="w-5 h-5 text-red-500" />
            </div>
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length > 0 ? (
            <div className="space-y-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.category}</p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(achievement.date_achieved), "PPP")}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(achievement.status)}`}>
                      {getStatusIcon(achievement.status)}
                      <span className="ml-1">{achievement.status}</span>
                    </div>
                  </div>
                  {achievement.status === "Rejected" && achievement.rejection_reason && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <p className="font-medium">Rejection Reason:</p>
                      <p>{achievement.rejection_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-6">No recent achievements found. Click "Add Achievement" to add your first achievement.</p>
          )}
        </CardContent>
      </Card>

      {/* Timetable Section */}
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-red-100 p-1.5 rounded-full">
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          {teacherDetails?.timetable_url ? (
            <Button
              className="w-full bg-[#ea384c] hover:bg-red-700 text-white font-bold py-3 rounded-lg"
              onClick={() => setShowTimetable(true)}
            >
              View Timetable
            </Button>
          ) : (
            <p className="text-gray-600 text-center">No timetable available</p>
          )}
        </CardContent>
      </Card>

      {/* Timetable Modal */}
      {showTimetable && teacherDetails?.timetable_url && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowTimetable(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={teacherDetails.timetable_url}
              alt="Timetable"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHome;
