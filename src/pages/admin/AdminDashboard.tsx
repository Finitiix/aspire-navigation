
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { toast } from "sonner";

type AchievementWithTeacher = {
  id: string;
  title: string;
  achievement_type: string;
  date_achieved: string;
  status: string;
  teacher_name: string;
  teacher_eid: string;
  teacher_designation: string;
  teacher_department: string;
  [key: string]: any;
};

const AdminDashboard = () => {
  const [pendingAchievements, setPendingAchievements] = useState<AchievementWithTeacher[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState<AchievementWithTeacher[]>([]);

  useEffect(() => {
    fetchPendingAchievements();
    fetchCounts();
    fetchRecentActivity();
  }, []);

  const fetchPendingAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('status', 'Pending Approval')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPendingAchievements(data || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast.error("Error fetching pending achievements");
    }
  };

  const fetchCounts = async () => {
    try {
      const { data: approvedData, error: approvedError } = await supabase
        .from('achievements')
        .select('id', { count: 'exact' })
        .eq('status', 'Approved');
      
      if (approvedError) throw approvedError;
      setApprovedCount(approvedData?.length || 0);

      const { data: rejectedData, error: rejectedError } = await supabase
        .from('achievements')
        .select('id', { count: 'exact' })
        .eq('status', 'Rejected');
      
      if (rejectedError) throw rejectedError;
      setRejectedCount(rejectedData?.length || 0);

      const { data: pendingData, error: pendingError } = await supabase
        .from('achievements')
        .select('id', { count: 'exact' })
        .eq('status', 'Pending Approval');
      
      if (pendingError) throw pendingError;
      setPendingCount(pendingData?.length || 0);
    } catch (error) {
      console.error("Error fetching counts:", error);
      toast.error("Error fetching achievement statistics");
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      toast.error("Error fetching recent activity");
    }
  };

  const updateAchievementStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      fetchPendingAchievements();
      fetchCounts();
      fetchRecentActivity();
      
      toast.success(`Achievement ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error("Error updating achievement:", error);
      toast.error("Error updating achievement status");
    }
  };

  const renderAchievementContent = (achievement: AchievementWithTeacher) => {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p className="text-sm font-medium">Teacher:</p>
            <p className="text-sm">{achievement.teacher_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">EID:</p>
            <p className="text-sm">{achievement.teacher_eid}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Department:</p>
            <p className="text-sm">{achievement.teacher_department}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Designation:</p>
            <p className="text-sm">{achievement.teacher_designation}</p>
          </div>
        </div>

        {achievement.achievement_type === 'Research & Publications' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">SCI Papers:</p>
                <p className="text-sm">{achievement.sci_papers || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Scopus Papers:</p>
                <p className="text-sm">{achievement.scopus_papers || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">UGC Papers:</p>
                <p className="text-sm">{achievement.ugc_papers || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Q1/Q2 Papers:</p>
                <p className="text-sm">{achievement.q_papers || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium">Google Scholar Link:</p>
              {achievement.google_scholar_link ? (
                <a 
                  href={achievement.google_scholar_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  {achievement.google_scholar_link}
                </a>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium">Scopus ID Link:</p>
              {achievement.scopus_id_link ? (
                <a 
                  href={achievement.scopus_id_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  {achievement.scopus_id_link}
                </a>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
          </div>
        )}

        {achievement.achievement_type === 'Book Published' && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Book Details:</p>
              <p className="text-sm">{achievement.book_details || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Book Chapters:</p>
              <p className="text-sm">{achievement.book_chapters || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Book Drive Link:</p>
              {achievement.book_drive_link ? (
                <a 
                  href={achievement.book_drive_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  {achievement.book_drive_link}
                </a>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
          </div>
        )}

        {achievement.achievement_type === 'Patents & Grants' && (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Patents Count:</p>
              <p className="text-sm">{achievement.patents_count || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Patents Remarks:</p>
              <p className="text-sm">{achievement.patents_remarks || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium">Patent Link:</p>
              {achievement.patent_link ? (
                <a 
                  href={achievement.patent_link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  {achievement.patent_link}
                </a>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium">Funded Projects:</p>
              <p className="text-sm">{achievement.funded_projects || 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-sm font-medium">Additional Information:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            <div>
              <p className="text-sm font-medium">Research Areas:</p>
              <p className="text-sm">{achievement.research_area || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Research Collaboration:</p>
              <p className="text-sm">{achievement.research_collaboration || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Awards/Recognitions:</p>
              <p className="text-sm">{achievement.awards_recognitions || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Consultancy Services:</p>
              <p className="text-sm">{achievement.consultancy_services || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Startups/Centers:</p>
              <p className="text-sm">{achievement.startup_details || 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm font-medium">General Remarks:</p>
            <p className="text-sm">{achievement.general_remarks || 'N/A'}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-green-50 text-green-600 hover:bg-green-100"
            onClick={() => updateAchievementStatus(achievement.id, 'Approved')}
          >
            <CheckCircle className="h-4 w-4 mr-1" /> Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-red-50 text-red-600 hover:bg-red-100"
            onClick={() => updateAchievementStatus(achievement.id, 'Rejected')}
          >
            <XCircle className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-blue-700">
              {approvedCount}
            </CardTitle>
            <CardDescription className="text-blue-600">Approved Achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-700">Total approved submissions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-red-700">
              {rejectedCount}
            </CardTitle>
            <CardDescription className="text-red-600">Rejected Achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm text-red-700">Total rejected submissions</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-yellow-700">
              {pendingCount}
            </CardTitle>
            <CardDescription className="text-yellow-600">Pending Approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-700">Pending review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Achievements awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingAchievements.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {pendingAchievements.map((achievement) => (
                  <AccordionItem key={achievement.id} value={achievement.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">{achievement.title}</span>
                        <span className="text-sm text-gray-500">
                          {achievement.achievement_type} | {format(new Date(achievement.date_achieved), 'PP')}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderAchievementContent(achievement)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-center py-4 text-gray-500">No pending achievements to review</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest achievement submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((achievement) => (
                  <div key={achievement.id} className="p-3 rounded-md border">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-gray-600">
                          {achievement.teacher_name} ({achievement.teacher_eid})
                        </p>
                        <p className="text-sm text-gray-600">
                          {achievement.achievement_type} | {format(new Date(achievement.date_achieved), 'PP')}
                        </p>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          achievement.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : achievement.status === 'Rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {achievement.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
