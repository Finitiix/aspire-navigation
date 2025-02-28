
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, Filter, FileDown, Edit, Trash, Download, Award, FileText
} from "lucide-react";
import { toast } from "sonner";

type TeacherType = {
  id: string;
  full_name: string;
  eid: string;
  designation: string;
  department: string;
  email_id: string;
  mobile_number: string;
  highest_qualification: string;
  date_of_joining: string;
  profile_pic_url: string | null;
  gender: string;
  skills: string[] | null;
  cabin_no: string | null;
  address: string | null;
  achievements?: AchievementType[];
};

type AchievementType = {
  id: string;
  achievement_type: string;
  title: string;
  date_achieved: string;
  status: string;
  issuing_organization: string;
  link_url?: string | null;
  quantity?: number | null;
  related_field?: string | null;
  collaboration?: string | null;
  remarks?: string | null;
};

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingTeacher, setEditingTeacher] = useState<TeacherType | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<AchievementType | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  // Fetch all teachers data
  useEffect(() => {
    const fetchTeachers = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase
          .from('teacher_details')
          .select(`
            *,
            achievements (
              id,
              achievement_type,
              title,
              date_achieved,
              status,
              issuing_organization,
              link_url,
              quantity,
              related_field,
              collaboration,
              remarks
            )
          `);
        
        if (data) {
          setTeachers(data as TeacherType[]);
          setFilteredTeachers(data as TeacherType[]);
          
          // Extract unique departments
          const uniqueDepartments = Array.from(new Set(data.map(t => t.department)));
          setDepartments(uniqueDepartments);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to load teachers data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Apply filters whenever search term or department filter changes
  useEffect(() => {
    let filtered = [...teachers];
    
    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(teacher => teacher.department === selectedDepartment);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        teacher => 
          teacher.full_name.toLowerCase().includes(term) || 
          teacher.eid.toLowerCase().includes(term) ||
          teacher.department.toLowerCase().includes(term) ||
          teacher.designation.toLowerCase().includes(term)
      );
    }
    
    setFilteredTeachers(filtered);
  }, [searchTerm, selectedDepartment, teachers]);

  const handleTeacherEdit = async (teacherId: string, updatedData: Partial<TeacherType>) => {
    try {
      const { error } = await supabase
        .from('teacher_details')
        .update(updatedData)
        .eq('id', teacherId);
      
      if (error) throw error;
      
      // Update local state
      setTeachers(prevTeachers => 
        prevTeachers.map(teacher => 
          teacher.id === teacherId ? { ...teacher, ...updatedData } : teacher
        )
      );
      
      toast.success("Teacher information updated successfully");
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Failed to update teacher information");
    }
  };

  const handleAchievementEdit = async (achievementId: string, updatedData: Partial<AchievementType>) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update(updatedData)
        .eq('id', achievementId);
      
      if (error) throw error;
      
      // Update local state
      setTeachers(prevTeachers => 
        prevTeachers.map(teacher => ({
          ...teacher,
          achievements: teacher.achievements?.map(achievement => 
            achievement.id === achievementId ? { ...achievement, ...updatedData } : achievement
          )
        }))
      );
      
      toast.success("Achievement updated successfully");
      setEditingAchievement(null);
    } catch (error) {
      console.error("Error updating achievement:", error);
      toast.error("Failed to update achievement");
    }
  };

  const handleAchievementDelete = async (achievementId: string) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', achievementId);
      
      if (error) throw error;
      
      // Update local state
      setTeachers(prevTeachers => 
        prevTeachers.map(teacher => ({
          ...teacher,
          achievements: teacher.achievements?.filter(achievement => achievement.id !== achievementId)
        }))
      );
      
      toast.success("Achievement deleted successfully");
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    }
  };

  const handleExport = (teacher: TeacherType, format: string) => {
    // Convert teacher data to appropriate format
    const teacherData = {
      "EID": teacher.eid,
      "Full Name": teacher.full_name,
      "Department": teacher.department,
      "Designation": teacher.designation,
      "Email": teacher.email_id,
      "Mobile": teacher.mobile_number,
      "Gender": teacher.gender,
      "Highest Qualification": teacher.highest_qualification,
      "Date of Joining": new Date(teacher.date_of_joining).toLocaleDateString(),
      "Cabin No": teacher.cabin_no || 'N/A',
      "Address": teacher.address || 'N/A',
      "Skills": teacher.skills?.join(', ') || 'N/A',
      "Achievements": teacher.achievements?.map(a => 
        `${a.title} (${a.achievement_type}) - ${a.issuing_organization}`
      ).join('\n') || 'None'
    };

    let content = '';
    let filename = `${teacher.eid}_${teacher.full_name.replace(/\s+/g, '_')}`;
    let mimetype = '';

    if (format === 'json') {
      content = JSON.stringify(teacherData, null, 2);
      filename += '.json';
      mimetype = 'application/json';
    } else if (format === 'csv') {
      // Convert object to CSV
      const headers = Object.keys(teacherData);
      const csvRows = [
        headers.join(','), 
        headers.map(header => {
          let value = teacherData[header as keyof typeof teacherData];
          // Wrap in quotes if it contains commas or newlines
          return typeof value === 'string' && (value.includes(',') || value.includes('\n')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      ];
      content = csvRows.join('\n');
      filename += '.csv';
      mimetype = 'text/csv';
    } else if (format === 'txt') {
      // Convert object to plain text
      content = Object.entries(teacherData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      filename += '.txt';
      mimetype = 'text/plain';
    }

    // Create and download the file
    const blob = new Blob([content], { type: mimetype });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`Teacher details exported as ${format.toUpperCase()}`);
  };

  // Teacher Edit Form Component
  const TeacherEditForm = ({ teacher }: { teacher: TeacherType }) => {
    const [formData, setFormData] = useState({ ...teacher });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleTeacherEdit(teacher.id, formData);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input name="full_name" value={formData.full_name} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">EID</label>
            <Input name="eid" value={formData.eid} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Input name="department" value={formData.department} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Designation</label>
            <Input name="designation" value={formData.designation} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input name="email_id" type="email" value={formData.email_id} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile</label>
            <Input name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile Picture URL</label>
            <Input name="profile_pic_url" value={formData.profile_pic_url || ''} onChange={handleChange} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Highest Qualification</label>
            <Input name="highest_qualification" value={formData.highest_qualification} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Cabin No</label>
            <Input name="cabin_no" value={formData.cabin_no || ''} onChange={handleChange} />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <Textarea name="address" value={formData.address || ''} onChange={handleChange} />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Skills (comma-separated)</label>
          <Input 
            name="skills" 
            value={formData.skills?.join(', ') || ''} 
            onChange={(e) => {
              const skillsArray = e.target.value 
                ? e.target.value.split(',').map(skill => skill.trim())
                : [];
              setFormData(prev => ({ ...prev, skills: skillsArray }));
            }} 
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setEditingTeacher(null)}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    );
  };

  // Achievement Edit Form Component
  const AchievementEditForm = ({ achievement }: { achievement: AchievementType }) => {
    const [formData, setFormData] = useState({ ...achievement });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAchievementEdit(achievement.id, formData);
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Achievement Type</label>
            <Input name="achievement_type" value={formData.achievement_type} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Issuing Organization</label>
            <Input name="issuing_organization" value={formData.issuing_organization} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Achieved</label>
            <Input name="date_achieved" type="date" value={formData.date_achieved} onChange={handleChange} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Link URL</label>
            <Input name="link_url" value={formData.link_url || ''} onChange={handleChange} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Related Field</label>
            <Input name="related_field" value={formData.related_field || ''} onChange={handleChange} />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Collaboration</label>
          <Textarea name="collaboration" value={formData.collaboration || ''} onChange={handleChange} />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Remarks</label>
          <Textarea name="remarks" value={formData.remarks || ''} onChange={handleChange} />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => setEditingAchievement(null)}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Teachers</CardTitle>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search teachers..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full md:w-auto"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter: {selectedDepartment || "All Departments"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedDepartment("")}>
                  All Departments
                </DropdownMenuItem>
                {departments.map((dept) => (
                  <DropdownMenuItem key={dept} onClick={() => setSelectedDepartment(dept)}>
                    {dept}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">Loading teachers data...</div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No teachers found matching the search criteria</div>
          ) : (
            <div className="space-y-4">
              {filteredTeachers.map((teacher) => (
                <Accordion key={teacher.id} type="single" collapsible className="border rounded-lg">
                  <AccordionItem value="details" className="border-none">
                    <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                      <div className="flex items-center gap-4 w-full">
                        {teacher.profile_pic_url ? (
                          <img
                            src={teacher.profile_pic_url}
                            alt={teacher.full_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {teacher.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="text-left flex-1">
                          <h3 className="font-medium">{teacher.full_name}</h3>
                          <p className="text-sm text-gray-600">{teacher.department} | {teacher.designation}</p>
                        </div>
                        <div className="flex">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FileDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleExport(teacher, 'json')}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export as JSON
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport(teacher, 'csv')}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export as CSV
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport(teacher, 'txt')}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export as TXT
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTeacher(teacher);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Teacher: {teacher.full_name}</DialogTitle>
                              </DialogHeader>
                              <TeacherEditForm teacher={teacher} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-4">
                        <div>
                          <h4 className="font-medium mb-3 text-lg">Profile Details</h4>
                          <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between">
                              <span className="font-medium">EID:</span>
                              <span>{teacher.eid}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Designation:</span>
                              <span>{teacher.designation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Email:</span>
                              <span>{teacher.email_id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Mobile:</span>
                              <span>{teacher.mobile_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Qualification:</span>
                              <span>{teacher.highest_qualification}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Joined:</span>
                              <span>{new Date(teacher.date_of_joining).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Gender:</span>
                              <span>{teacher.gender}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Cabin No:</span>
                              <span>{teacher.cabin_no || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Skills:</span>
                              <span className="text-right max-w-[60%]">
                                {teacher.skills ? teacher.skills.join(', ') : 'N/A'}
                              </span>
                            </div>
                          </div>
                          {teacher.address && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-start">
                                <span className="font-medium">Address:</span>
                                <span className="text-right max-w-[60%]">{teacher.address}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-lg">Achievements</h4>
                            <span className="text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded-full">
                              {teacher.achievements?.length || 0} total
                            </span>
                          </div>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                            {teacher.achievements?.length ? (
                              teacher.achievements.map((achievement) => (
                                <Card key={achievement.id} className="p-3 hover:shadow-md transition-all duration-300">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-blue-500" />
                                        <p className="font-medium">{achievement.title}</p>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1">{achievement.achievement_type}</p>
                                      <p className="text-sm mt-1">
                                        {achievement.issuing_organization} • {new Date(achievement.date_achieved).toLocaleDateString()}
                                      </p>
                                      
                                      {achievement.link_url && (
                                        <a 
                                          href={achievement.link_url}
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                        >
                                          <Download className="h-3 w-3" />
                                          View Resource
                                        </a>
                                      )}
                                      
                                      {achievement.collaboration && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          <span className="font-medium">Collaboration:</span> {achievement.collaboration}
                                        </p>
                                      )}
                                      
                                      {achievement.remarks && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          <span className="font-medium">Remarks:</span> {achievement.remarks}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex flex-col ml-2">
                                      <span className={`px-2 py-1 text-xs rounded-full text-center ${
                                        achievement.status === 'Approved' 
                                          ? 'bg-green-100 text-green-800'
                                          : achievement.status === 'Rejected'
                                          ? 'bg-red-100 text-red-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {achievement.status}
                                      </span>
                                      <div className="flex mt-2 justify-end">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAchievement(achievement);
                                              }}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                              <DialogTitle>Edit Achievement</DialogTitle>
                                            </DialogHeader>
                                            <AchievementEditForm achievement={achievement} />
                                          </DialogContent>
                                        </Dialog>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-500"
                                          onClick={() => handleAchievementDelete(achievement.id)}
                                        >
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))
                            ) : (
                              <p className="text-gray-500 text-center py-6">No achievements recorded</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTeachers;
