
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AchievementForm } from "@/components/teacher/AchievementForm";
import { supabase } from "@/integrations/supabase/client";

const TeacherHome = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState({
    important: '',
    details: ''
  });
  const [isAchievementFormOpen, setIsAchievementFormOpen] = useState(false);

  useEffect(() => {
    // Fetch admin messages
    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('admin_messages')
          .select('*')
          .single();
        if (data) {
          setMessages({
            important: data.important_message || '',
            details: data.important_details || ''
          });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Important Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Important Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{messages.important || 'No important messages'}</p>
          </CardContent>
        </Card>

        {/* Add Achievement Button */}
        <div className="flex items-center justify-center">
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
        </div>
      </div>

      {/* Important Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Important Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{messages.details || 'No important details'}</p>
        </CardContent>
      </Card>

      {/* Timetable */}
      <Card>
        <CardHeader>
          <CardTitle>Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2 text-sm">
            <div className="font-bold">Time</div>
            <div className="font-bold">Monday</div>
            <div className="font-bold">Tuesday</div>
            <div className="font-bold">Wednesday</div>
            <div className="font-bold">Thursday</div>
            <div className="font-bold">Friday</div>
            {/* Add dummy timetable rows */}
            {Array.from({ length: 8 }).map((_, i) => (
              <>
                <div key={`time-${i}`} className="py-2">{`${8 + i}:00`}</div>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={`cell-${i}-${j}`} className="bg-gray-50 p-2 rounded">-</div>
                ))}
              </>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherHome;
