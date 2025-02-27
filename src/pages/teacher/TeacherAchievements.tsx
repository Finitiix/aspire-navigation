import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AchievementForm } from "@/components/teacher/AchievementForm";

type Achievement = {
  id: string;
  achievement_type: string;
  title: string;
  date_achieved: string;
  issuing_organization: string;
  status: string;
  quantity?: number;
};

const TeacherAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showForm, setShowForm] = useState(false); // Control modal visibility

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('achievements')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) setAchievements(data);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8">

        {/* Add Achievement Button */}
        <Button 
          className="bg-[#ea384c] hover:bg-red-700 text-white font-bold py-10 px-6 rounded-lg text-lg w-full"
          onClick={() => setShowForm(true)}
        >
          Add Achievement
        </Button>

        {/* Achievement History */}
        <Card>
          <CardHeader>
            <CardTitle>Achievement History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.achievement_type}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        achievement.status === 'Approved' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {achievement.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Issuing Organization: {achievement.issuing_organization}</p>
                      <p>Date: {format(new Date(achievement.date_achieved), 'PPP')}</p>
                      {achievement.quantity && (
                        <p>Quantity: {achievement.quantity}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {achievements.length === 0 && (
                <p className="text-gray-600 text-center py-4">No achievements submitted yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popup Form (Modal) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-3 top-3"
              onClick={() => setShowForm(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            {/* Scrollable Form */}
            <h2 className="text-xl font-bold mb-4">Add Achievement</h2>
            <div className="max-h-[70vh] overflow-y-auto">
              <AchievementForm />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAchievements;
