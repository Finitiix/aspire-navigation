import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AchievementForm } from "@/components/teacher/AchievementForm";
import { supabase } from "@/integrations/supabase/client";

const TeacherHome = () => {
  const [messages, setMessages] = useState({
    important_messages: [],
    important_details: [],
  });

  const [isAchievementFormOpen, setIsAchievementFormOpen] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [showTimetable, setShowTimetable] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchTeacherDetails();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Important Messages Section */}
        <Card className="h-72">
          <CardHeader>
            <CardTitle>Important Messages</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto h-[calc(100%-4rem)]">
            {messages.important_messages.length > 0 ? (
              messages.important_messages.map((msg, index) => (
                <p key={index} className="text-gray-600 mb-2">{msg.message}</p>
              ))
            ) : (
              <p className="text-gray-600">No important messages</p>
            )}
          </CardContent>
        </Card>

        {/* Add Achievement Button */}
        <div className="flex flex-col gap-6">
          <Dialog open={isAchievementFormOpen} onOpenChange={setIsAchievementFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full h-32 bg-red-500 hover:bg-red-600">
                <Plus className="w-6 h-6 mr-2" />
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

          {/* Important Details Section */}
          <Card className="h-36">
            <CardHeader>
              <CardTitle>Important Details</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.important_details.length > 0 ? (
                messages.important_details.map((detail, index) => (
                  <p key={index} className="text-gray-600 mb-2">{detail.detail}</p>
                ))
              ) : (
                <p className="text-gray-600">No important details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timetable Section */}
      <Card className="h-40">
        <CardHeader>
          <CardTitle>My Timetable</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center">
          {teacherDetails?.timetable_url ? (
            <Button
              style={{ backgroundColor: "#ea384c", color: "#fff" }}
              onClick={() => setShowTimetable(true)}
              className="w-full"
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
