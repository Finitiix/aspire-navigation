
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, X, Check, ExternalLink, Download, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";

type Achievement = {
  id: string;
  achievement_type: string;
  title: string;
  date_achieved: string;
  status: string;
  [key: string]: any; // For dynamic fields
};

type Teacher = {
  id: string;
  full_name: string;
  department: string;
  eid: string;
  designation: string;
  profile_pic_url: string | null;
  achievements: Achievement[];
  [key: string]: any; // For additional fields
};

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from('teacher_details')
      .select(`
        *,
        achievements (
          *
        )
      `);
    
    if (data) {
      setTeachers(data);
      setFilteredTeachers(data);
      
      // Extract unique departments for filtering
      const uniqueDepartments = Array.from(new Set(data.map(teacher => teacher.department)));
      setDepartments(uniqueDepartments);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, departmentFilter);
  };

  const handleDepartmentFilter = (department: string) => {
    setDepartmentFilter(department);
    applyFilters(searchQuery, department);
  };

  const applyFilters = (query: string, department: string) => {
    let filtered = [...teachers];
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(teacher => 
        teacher.full_name.toLowerCase().includes(lowerQuery) ||
        teacher.eid.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (department) {
      filtered = filtered.filter(teacher => teacher.department === department);
    }
    
    setFilteredTeachers(filtered);
  };

  const updateAchievementStatus = async (achievementId: string, status: 'Approved' | 'Rejected' | 'Pending Approval') => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ status })
        .eq('id', achievementId);
      
      if (error) throw error;
      
      // Update local state
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.achievements && teacher.achievements.some(a => a.id === achievementId)) {
          return {
            ...teacher,
            achievements: teacher.achievements.map(achievement => 
              achievement.id === achievementId 
                ? { ...achievement, status } 
                : achievement
            )
          };
        }
        return teacher;
      });
      
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers);
      toast.success(`Achievement ${status.toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to update achievement status");
      console.error(error);
    }
  };

  const handleEditAchievement = async () => {
    if (!editingAchievement) return;
    
    try {
      const { error } = await supabase
        .from('achievements')
        .update(editingAchievement)
        .eq('id', editingAchievement.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedTeachers = teachers.map(teacher => {
        if (teacher.achievements && teacher.achievements.some(a => a.id === editingAchievement.id)) {
          return {
            ...teacher,
            achievements: teacher.achievements.map(achievement => 
              achievement.id === editingAchievement.id 
                ? editingAchievement 
                : achievement
            )
          };
        }
        return teacher;
      });
      
      setTeachers(updatedTeachers);
      setFilteredTeachers(updatedTeachers);
      setIsEditDialogOpen(false);
      setEditingAchievement(null);
      toast.success("Achievement updated successfully");
    } catch (error) {
      toast.error("Failed to update achievement");
      console.error(error);
    }
  };

  const handleEditClick = (achievement: Achievement) => {
    setEditingAchievement({ ...achievement });
    setIsEditDialogOpen(true);
  };

  const exportTeacherData = (teacher: Teacher, format: string) => {
    // This is a simplified example for CSV export
    // For PDF and other formats, you would use libraries like jsPDF or docx
    if (format === 'csv') {
      const achievementsData = teacher.achievements.map(a => {
        return {
          'Type': a.achievement_type,
          'Title': a.title,
          'Date': format(new Date(a.date_achieved), 'yyyy-MM-dd'),
          'Status': a.status,
          'SCI Papers': a.sci_papers || '',
          'Scopus Papers': a.scopus_papers || '',
          'UGC Papers': a.ugc_papers || '',
          'Patent Count': a.patents_count || '',
          'Research Area': a.research_area || '',
          // Add more fields as needed
        };
      });
      
      // Convert to CSV
      const headers = Object.keys(achievementsData[0] || {}).join(',');
      const rows = achievementsData.map(obj => Object.values(obj).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `${teacher.eid}_achievements.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Exported ${teacher.full_name}'s data as CSV`);
    } else {
      toast.info(`Export as ${format.toUpperCase()} is not implemented yet`);
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
          {value.substring(0, 30)}... <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      );
    }
    
    return value;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
          
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-10" 
                placeholder="Search by name or EID..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={departmentFilter} onValueChange={handleDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <Accordion key={teacher.id} type="single" collapsible>
                <AccordionItem value="details">
                  <AccordionTrigger className="px-4">
                    <div className="flex items-center gap-4">
                      {teacher.profile_pic_url ? (
                        <img
                          src={teacher.profile_pic_url}
                          alt={teacher.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xl font-bold text-gray-500">
                            {teacher.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="text-left">
                        <h3 className="font-medium">{teacher.full_name}</h3>
                        <p className="text-sm text-gray-600">{teacher.department} | EID: {teacher.eid}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="grid grid-cols-1 gap-4 py-4">
                      <div>
                        <div className="flex justify-between mb-4">
                          <h4 className="font-medium">Profile Details</h4>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => exportTeacherData(teacher, 'csv')}>
                              <Download className="h-4 w-4 mr-1" /> Export CSV
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-6">
                          <div>
                            <p className="font-medium">EID:</p>
                            <p>{teacher.eid}</p>
                          </div>
                          <div>
                            <p className="font-medium">Designation:</p>
                            <p>{teacher.designation}</p>
                          </div>
                          <div>
                            <p className="font-medium">Department:</p>
                            <p>{teacher.department}</p>
                          </div>
                          <div>
                            <p className="font-medium">Email:</p>
                            <p>{teacher.email_id}</p>
                          </div>
                          <div>
                            <p className="font-medium">Mobile:</p>
                            <p>{teacher.mobile_number}</p>
                          </div>
                          <div>
                            <p className="font-medium">Qualification:</p>
                            <p>{teacher.highest_qualification}</p>
                          </div>
                          <div>
                            <p className="font-medium">Joined:</p>
                            <p>{new Date(teacher.date_of_joining).toLocaleDateString()}</p>
                          </div>
                          {teacher.address && (
                            <div>
                              <p className="font-medium">Address:</p>
                              <p>{teacher.address}</p>
                            </div>
                          )}
                        </div>
                        
                        <h4 className="font-medium mb-4">Achievements</h4>
                        <div className="space-y-4">
                          {teacher.achievements?.length > 0 ? (
                            teacher.achievements.map((achievement) => (
                              <Card key={achievement.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium">{achievement.title}</p>
                                    <p className="text-sm text-gray-600">
                                      {achievement.achievement_type} | {new Date(achievement.date_achieved).toLocaleDateString()}
                                    </p>
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
                                  <AccordionItem value="achievement-details">
                                    <AccordionTrigger className="text-sm py-1">View Details</AccordionTrigger>
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
                                      
                                      {/* Admin Action Buttons */}
                                      <div className="flex justify-end mt-4 space-x-2">
                                        {achievement.status !== 'Approved' && (
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="bg-green-50 text-green-600 hover:bg-green-100"
                                            onClick={() => updateAchievementStatus(achievement.id, 'Approved')}
                                          >
                                            <Check className="h-4 w-4 mr-1" /> Approve
                                          </Button>
                                        )}
                                        
                                        {achievement.status !== 'Rejected' && (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            className="bg-red-50 text-red-600 hover:bg-red-100"
                                            onClick={() => updateAchievementStatus(achievement.id, 'Rejected')}
                                          >
                                            <X className="h-4 w-4 mr-1" /> Reject
                                          </Button>
                                        )}
                                        
                                        {achievement.status !== 'Pending Approval' && (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => updateAchievementStatus(achievement.id, 'Pending Approval')}
                                          >
                                            Reset to Pending
                                          </Button>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </Card>
                            ))
                          ) : (
                            <p className="text-gray-600">No achievements recorded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
            
            {filteredTeachers.length === 0 && (
              <p className="text-center text-gray-600 py-8">No teachers found matching your search criteria</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Achievement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
          </DialogHeader>
          
          {editingAchievement && (
            <form onSubmit={(e) => { e.preventDefault(); handleEditAchievement(); }} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editingAchievement.title}
                    onChange={(e) => setEditingAchievement({...editingAchievement, title: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={editingAchievement.status}
                    onValueChange={(value) => setEditingAchievement({...editingAchievement, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Dynamic fields based on achievement type */}
                {editingAchievement.achievement_type === 'Research & Publications' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">SCI Papers</label>
                        <Input
                          value={editingAchievement.sci_papers || ''}
                          onChange={(e) => setEditingAchievement({...editingAchievement, sci_papers: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Scopus Papers</label>
                        <Input
                          value={editingAchievement.scopus_papers || ''}
                          onChange={(e) => setEditingAchievement({...editingAchievement, scopus_papers: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Scopus ID Link</label>
                      <Input
                        value={editingAchievement.scopus_id_link || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, scopus_id_link: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">UGC Papers</label>
                      <Input
                        value={editingAchievement.ugc_papers || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, ugc_papers: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Google Scholar Link</label>
                      <Input
                        value={editingAchievement.google_scholar_link || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, google_scholar_link: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Q1/Q2 Papers</label>
                      <Input
                        value={editingAchievement.q_papers || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, q_papers: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {editingAchievement.achievement_type === 'Book Published' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Book Drive Link</label>
                      <Input
                        value={editingAchievement.book_drive_link || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, book_drive_link: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Book Details</label>
                      <Input
                        value={editingAchievement.book_details || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, book_details: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Book Chapters</label>
                      <Input
                        value={editingAchievement.book_chapters || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, book_chapters: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {editingAchievement.achievement_type === 'Patents & Grants' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Patents Count</label>
                      <Input
                        value={editingAchievement.patents_count || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, patents_count: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Patent Link</label>
                      <Input
                        value={editingAchievement.patent_link || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, patent_link: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Patent Remarks</label>
                      <Input
                        value={editingAchievement.patents_remarks || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, patents_remarks: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Funded Projects</label>
                      <Input
                        value={editingAchievement.funded_projects || ''}
                        onChange={(e) => setEditingAchievement({...editingAchievement, funded_projects: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                {/* Common fields for all types */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Research Collaboration</label>
                  <Input
                    value={editingAchievement.research_collaboration || ''}
                    onChange={(e) => setEditingAchievement({...editingAchievement, research_collaboration: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Awards/Recognitions</label>
                  <Input
                    value={editingAchievement.awards_recognitions || ''}
                    onChange={(e) => setEditingAchievement({...editingAchievement, awards_recognitions: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consultancy Services</label>
                  <Input
                    value={editingAchievement.consultancy_services || ''}
                    onChange={(e) => setEditingAchievement({...editingAchievement, consultancy_services: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Startups/Excellence Centers</label>
                  <Input
                    value={editingAchievement.startup_details || ''}
                    onChange={(e) => setEditingAchievement({...editingAchievement, startup_details: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Research Areas</label>
                  <Input
                    value={editingAchievement.research_area || ''}
                    onChange={(e) => setEditingAchievement({...editingAchievement, research_area: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">General Remarks</label>
                  <Input
                    value={editingAchievement.general_remarks || ''}
                    onChange={(e) => setEditingAchievement({...editingAchievement, general_remarks: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeachers;
