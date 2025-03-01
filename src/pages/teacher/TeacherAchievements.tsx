
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X, Pencil, ExternalLink } from "lucide-react";
import { AchievementForm } from "@/components/teacher/AchievementForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Achievement = {
  id: string;
  achievement_type: string;
  title: string;
  date_achieved: string;
  status: string;
  [key: string]: any; // For dynamic fields
};

const TeacherAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

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

  const handleEditClick = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingAchievement(null);
    fetchAchievements();
  };

  const handleAddSuccess = () => {
    setShowForm(false);
    fetchAchievements();
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const renderFieldValue = (value: any, isLink = false) => {
    if (!value) return <span className="text-gray-400">Not provided</span>;
    
    if (isLink && value.startsWith('http')) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center"
        >
          {value} <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      );
    }
    
    return value;
  };

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
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <Card key={achievement.id} className="p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.achievement_type}</p>
                          <p className="text-sm text-gray-600">Date: {format(new Date(achievement.date_achieved), 'PPP')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(achievement.status)}`}>
                            {achievement.status}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditClick(achievement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details">
                          <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-2">
                              {achievement.achievement_type === 'Research & Publications' && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">SCI Papers:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.sci_papers)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Scopus Papers:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.scopus_papers)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Scopus ID:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.scopus_id_link, true)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">UGC Papers:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.ugc_papers)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Google Scholar:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.google_scholar_link, true)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Q1/Q2 Papers:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.q_papers)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Research Remarks:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.research_remarks)}</p>
                                  </div>
                                </>
                              )}
                              
                              {achievement.achievement_type === 'Book Published' && (
                                <>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Book Drive Link:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.book_drive_link, true)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Book Details:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.book_details)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Book Chapters:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.book_chapters)}</p>
                                  </div>
                                </>
                              )}
                              
                              {achievement.achievement_type === 'Patents & Grants' && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">Patents Count:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.patents_count)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Patent Link:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.patent_link, true)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Patents Remarks:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.patents_remarks)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Funded Projects:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.funded_projects)}</p>
                                  </div>
                                </>
                              )}
                              
                              {/* Common fields for all types */}
                              <div className="col-span-2 mt-2">
                                <p className="text-sm font-medium">Additional Information:</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Research Collaboration:</p>
                                <p className="text-sm">{renderFieldValue(achievement.research_collaboration)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Awards/Recognitions:</p>
                                <p className="text-sm">{renderFieldValue(achievement.awards_recognitions)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Consultancy Services:</p>
                                <p className="text-sm">{renderFieldValue(achievement.consultancy_services)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Startups/Excellence Centers:</p>
                                <p className="text-sm">{renderFieldValue(achievement.startup_details)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">Research Areas:</p>
                                <p className="text-sm">{renderFieldValue(achievement.research_area)}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium">General Remarks:</p>
                                <p className="text-sm">{renderFieldValue(achievement.general_remarks)}</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-gray-600 text-center py-4">No achievements submitted yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Achievement Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-3 top-3"
              onClick={() => setShowForm(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <h2 className="text-xl font-bold mb-4">Add Achievement</h2>
            <div className="max-h-[70vh] overflow-y-auto">
              <AchievementForm onSuccess={handleAddSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Achievement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          {editingAchievement && (
            <AchievementForm 
              initialData={editingAchievement} 
              isEditing={true} 
              onSuccess={handleEditSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherAchievements;
