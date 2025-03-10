
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { X, Pencil, ExternalLink, FileText } from "lucide-react";
import { AchievementForm } from "@/components/teacher/AchievementForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AchievementStats } from "@/components/teacher/AchievementStats";
import { toast } from "sonner";

type Achievement = {
  id: string;
  category: string;
  title: string;
  date_achieved: string;
  status: string;
  document_url: string;
  [key: string]: any; // For dynamic fields
};

const TeacherAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('detailed_achievements')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setAchievements(data);
      if (error) console.error("Error fetching achievements:", error);
    }
  };

  const handleEditClick = (achievement: Achievement) => {
    if (achievement.status === "Approved") {
      return;
    }
    
    const achievementData = {
      ...achievement,
      achievement_type: getCategoryType(achievement.category)
    };
    
    setEditingAchievement(achievementData);
    setIsEditDialogOpen(true);
  };

  const getCategoryType = (category: string) => {
    const categoryMap: Record<string, string> = {
      'Journal Articles': 'Research & Publications',
      'Conference Papers': 'Research & Publications',
      'Books & Book Chapters': 'Book Published',
      'Patents': 'Patents & Grants',
      'Awards & Recognitions': 'Awards & Recognitions',
      'Consultancy & Funded Projects': 'Projects & Workshops',
      'Startups & Centers of Excellence': 'Others',
      'Others': 'Others'
    };
    
    return categoryMap[category] || 'Others';
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setEditingAchievement(null);
    fetchAchievements();
    toast.success("Achievement updated successfully");
  };

  const handleAddSuccess = () => {
    setShowForm(false);
    fetchAchievements();
    toast.success("Achievement added successfully");
  };

  const handleViewDocument = (url: string) => {
    setViewDocumentUrl(url);
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
        {/* Achievement Statistics */}
        <AchievementStats />

        <Button 
          className="bg-[#ea384c] hover:bg-red-700 text-white font-bold py-10 px-6 rounded-lg text-lg w-full"
          onClick={() => setShowForm(true)}
        >
          Add Achievement
        </Button>

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
                          <p className="text-sm text-gray-600">{achievement.category}</p>
                          <p className="text-sm text-gray-600">Date: {format(new Date(achievement.date_achieved), 'PPP')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(achievement.status)}`}>
                            {achievement.status}
                          </span>
                          {achievement.status !== "Approved" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditClick(achievement)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {achievement.document_url && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-blue-600"
                            onClick={() => handleViewDocument(achievement.document_url)}
                          >
                            <FileText className="h-4 w-4" />
                            View Uploaded Proof
                          </Button>
                        </div>
                      )}
                      
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="details">
                          <AccordionTrigger className="text-sm">View Details</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-2">
                              {achievement.category === 'Journal Articles' && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">Journal Name:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.journal_name)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">ISSN:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.issn)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">DOI:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.doi)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Publisher:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.publisher)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Scopus ID:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.scopus_id_link, true)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Google Scholar:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.google_scholar_link, true)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Q1/Q2 Papers:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.q_ranking)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Journal Link:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.journal_link, true)}</p>
                                  </div>
                                </>
                              )}
                              
                              {achievement.category === 'Conference Papers' && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">Conference Name:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.conference_name)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Conference Date:</p>
                                    <p className="text-sm">{achievement.conference_date ? format(new Date(achievement.conference_date), 'PPP') : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">DOI:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.doi)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">ISBN:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.isbn)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Paper Link:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.paper_link, true)}</p>
                                  </div>
                                </>
                              )}
                              
                              {(achievement.category === 'Books & Book Chapters') && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">Book Title:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.book_title)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Publisher:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.publisher)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">ISBN:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.isbn)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Year of Publication:</p>
                                    <p className="text-sm">{achievement.year_of_publication ? format(new Date(achievement.year_of_publication), 'PPP') : 'Not provided'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Book Drive Link:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.book_drive_link, true)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-sm font-medium">Book Chapters:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.chapter_title)}</p>
                                  </div>
                                </>
                              )}
                              
                              {achievement.category === 'Patents' && (
                                <>
                                  <div>
                                    <p className="text-sm font-medium">Patent Number:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.patent_number)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Patent Office:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.patent_office)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Filing Date:</p>
                                    <p className="text-sm">{achievement.filing_date ? format(new Date(achievement.filing_date), 'PPP') : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Grant Date:</p>
                                    <p className="text-sm">{achievement.grant_date ? format(new Date(achievement.grant_date), 'PPP') : 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Patents Status:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.patent_status)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Patent Link:</p>
                                    <p className="text-sm">{renderFieldValue(achievement.patent_link, true)}</p>
                                  </div>
                                </>
                              )}
                              
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
                                <p className="text-sm">{renderFieldValue(achievement.remarks)}</p>
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

      {viewDocumentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-6xl max-h-[90vh] w-full overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={() => setViewDocumentUrl(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium mb-4">Achievement Proof Document</h3>
              
              <div className="w-full h-[70vh] border border-gray-300 rounded">
                <iframe 
                  src={viewDocumentUrl} 
                  title="Document Preview"
                  className="w-full h-full"
                />
              </div>
              
              <div className="mt-4">
                <a 
                  href={viewDocumentUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAchievements;
