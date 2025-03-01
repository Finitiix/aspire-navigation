
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AchievementType = 
  | "Research & Publications"
  | "Book Published"
  | "Patents & Grants"
  | "Certifications & Courses"
  | "Awards & Recognitions"
  | "Projects & Workshops"
  | "Others";

const achievementTypes: AchievementType[] = [
  'Research & Publications',
  'Book Published',
  'Patents & Grants',
  'Certifications & Courses',
  'Awards & Recognitions',
  'Projects & Workshops',
  'Others'
];

type FormData = {
  achievement_type: AchievementType | '';
  title: string;
  sci_papers: string;
  scopus_papers: string;
  scopus_id_link: string;
  ugc_papers: string;
  google_scholar_link: string;
  research_remarks: string;
  book_drive_link: string;
  book_details: string;
  book_chapters: string;
  q_papers: string;
  patents_count: string;
  patent_link: string;
  patents_remarks: string;
  research_collaboration: string;
  awards_recognitions: string;
  consultancy_services: string;
  funded_projects: string;
  startup_details: string;
  research_area: string;
  general_remarks: string;
};

interface AchievementFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export const AchievementForm = ({ onSuccess, initialData, isEditing = false }: AchievementFormProps) => {
  const [loading, setLoading] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(
    initialData?.date_achieved ? new Date(initialData.date_achieved) : undefined
  );

  const [formData, setFormData] = useState<FormData>({
    achievement_type: initialData?.achievement_type || '',
    title: initialData?.title || '',
    sci_papers: initialData?.sci_papers || '',
    scopus_papers: initialData?.scopus_papers || '',
    scopus_id_link: initialData?.scopus_id_link || '',
    ugc_papers: initialData?.ugc_papers || '',
    google_scholar_link: initialData?.google_scholar_link || '',
    research_remarks: initialData?.research_remarks || '',
    book_drive_link: initialData?.book_drive_link || '',
    book_details: initialData?.book_details || '',
    book_chapters: initialData?.book_chapters || '',
    q_papers: initialData?.q_papers || '',
    patents_count: initialData?.patents_count || '',
    patent_link: initialData?.patent_link || '',
    patents_remarks: initialData?.patents_remarks || '',
    research_collaboration: initialData?.research_collaboration || '',
    awards_recognitions: initialData?.awards_recognitions || '',
    consultancy_services: initialData?.consultancy_services || '',
    funded_projects: initialData?.funded_projects || '',
    startup_details: initialData?.startup_details || '',
    research_area: initialData?.research_area || '',
    general_remarks: initialData?.general_remarks || '',
  });

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('teacher_details')
          .select('*')
          .eq('id', user.id)
          .single();
        setTeacherDetails(data);
      }
    };

    fetchTeacherDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !teacherDetails || !formData.achievement_type) {
      toast.error("Required fields are missing");
      return;
    }

    setLoading(true);
    try {
      const achievementData = {
        teacher_id: teacherDetails.id,
        achievement_type: formData.achievement_type,
        title: formData.title,
        date_achieved: format(date, 'yyyy-MM-dd'),
        teacher_name: teacherDetails.full_name,
        teacher_eid: teacherDetails.eid,
        teacher_designation: teacherDetails.designation,
        teacher_mobile: teacherDetails.mobile_number,
        teacher_department: teacherDetails.department,
        sci_papers: formData.sci_papers || null,
        scopus_papers: formData.scopus_papers || null,
        scopus_id_link: formData.scopus_id_link || null,
        ugc_papers: formData.ugc_papers || null,
        google_scholar_link: formData.google_scholar_link || null,
        research_remarks: formData.research_remarks || null,
        book_drive_link: formData.book_drive_link || null,
        book_details: formData.book_details || null,
        book_chapters: formData.book_chapters || null,
        q_papers: formData.q_papers || null,
        patents_count: formData.patents_count || null,
        patent_link: formData.patent_link || null,
        patents_remarks: formData.patents_remarks || null,
        research_collaboration: formData.research_collaboration || null,
        awards_recognitions: formData.awards_recognitions || null,
        consultancy_services: formData.consultancy_services || null,
        funded_projects: formData.funded_projects || null,
        startup_details: formData.startup_details || null,
        research_area: formData.research_area || null,
        general_remarks: formData.general_remarks || null,
        status: 'Pending Approval',
      };

      if (isEditing && initialData?.id) {
        // Update existing achievement
        const { error } = await supabase
          .from('achievements')
          .update({
            ...achievementData,
            status: initialData.status // Preserve the current status
          })
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success("Achievement updated successfully!");
      } else {
        // Insert new achievement
        const { error } = await supabase
          .from('achievements')
          .insert(achievementData);

        if (error) throw error;
        toast.success("Achievement submitted successfully!");
      }
      
      // Reset form for new submissions
      if (!isEditing) {
        setFormData({
          achievement_type: '',
          title: '',
          sci_papers: '',
          scopus_papers: '',
          scopus_id_link: '',
          ugc_papers: '',
          google_scholar_link: '',
          research_remarks: '',
          book_drive_link: '',
          book_details: '',
          book_chapters: '',
          q_papers: '',
          patents_count: '',
          patent_link: '',
          patents_remarks: '',
          research_collaboration: '',
          awards_recognitions: '',
          consultancy_services: '',
          funded_projects: '',
          startup_details: '',
          research_area: '',
          general_remarks: '',
        });
        setDate(undefined);
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit achievement");
    } finally {
      setLoading(false);
    }
  };

  const showResearchFields = formData.achievement_type === 'Research & Publications';
  const showBookFields = formData.achievement_type === 'Book Published';
  const showPatentFields = formData.achievement_type === 'Patents & Grants';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Achievement" : "Add New Achievement"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic information - always visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={teacherDetails?.full_name || ''} disabled />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">EID</label>
              <Input value={teacherDetails?.eid || ''} disabled />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Designation</label>
              <Input value={teacherDetails?.designation || ''} disabled />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile No.</label>
              <Input value={teacherDetails?.mobile_number || ''} disabled />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input value={teacherDetails?.department || ''} disabled />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Achievement Type *</label>
            <Select
              required
              value={formData.achievement_type}
              onValueChange={(value: AchievementType) => setFormData(prev => ({ ...prev, achievement_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select achievement type" />
              </SelectTrigger>
              <SelectContent>
                {achievementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Achievement *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Research & Publications fields */}
          {showResearchFields && (
            <div className="border p-4 rounded-md space-y-4">
              <h3 className="font-medium">Research & Publications Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">No. of Papers in SCI</label>
                  <Input
                    type="number"
                    value={formData.sci_papers}
                    onChange={(e) => setFormData(prev => ({ ...prev, sci_papers: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">No. of Papers in Scopus</label>
                  <Input
                    type="number"
                    value={formData.scopus_papers}
                    onChange={(e) => setFormData(prev => ({ ...prev, scopus_papers: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Scopus ID Link</label>
                <Input
                  type="url"
                  value={formData.scopus_id_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, scopus_id_link: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Papers in UGC Approved Journals</label>
                <Input
                  type="number"
                  value={formData.ugc_papers}
                  onChange={(e) => setFormData(prev => ({ ...prev, ugc_papers: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Google Scholar Link</label>
                <Input
                  type="url"
                  value={formData.google_scholar_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_scholar_link: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Papers in Q1/Q2 Journals and Link</label>
                <Textarea
                  value={formData.q_papers}
                  onChange={(e) => setFormData(prev => ({ ...prev, q_papers: e.target.value }))}
                  placeholder="Include number and links"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks/Other Research Achievements</label>
                <Textarea
                  value={formData.research_remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, research_remarks: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Book Published fields */}
          {showBookFields && (
            <div className="border p-4 rounded-md space-y-4">
              <h3 className="font-medium">Book Publication Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Book Drive Link with ISBN Number</label>
                <Input
                  type="url"
                  value={formData.book_drive_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, book_drive_link: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Book Details</label>
                <Textarea
                  value={formData.book_details}
                  onChange={(e) => setFormData(prev => ({ ...prev, book_details: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">WOS/SCOPUS Indexed Book Chapters</label>
                <Textarea
                  value={formData.book_chapters}
                  onChange={(e) => setFormData(prev => ({ ...prev, book_chapters: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Patents & Grants fields */}
          {showPatentFields && (
            <div className="border p-4 rounded-md space-y-4">
              <h3 className="font-medium">Patents & Grants Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Patents (filed/published/granted/tech transfer)</label>
                <Input
                  value={formData.patents_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, patents_count: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Patent Link</label>
                <Input
                  type="url"
                  value={formData.patent_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, patent_link: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks about Patents</label>
                <Textarea
                  value={formData.patents_remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, patents_remarks: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Funded Projects</label>
                <Textarea
                  value={formData.funded_projects}
                  onChange={(e) => setFormData(prev => ({ ...prev, funded_projects: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Common fields for all types */}
          <div className="border p-4 rounded-md space-y-4">
            <h3 className="font-medium">Additional Information</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Any Research Collaboration</label>
              <Textarea
                value={formData.research_collaboration}
                onChange={(e) => setFormData(prev => ({ ...prev, research_collaboration: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Awards/Achievements/Recognitions (govt./non-govt)</label>
              <Textarea
                value={formData.awards_recognitions}
                onChange={(e) => setFormData(prev => ({ ...prev, awards_recognitions: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Details of Any Consultancy Services</label>
              <Textarea
                value={formData.consultancy_services}
                onChange={(e) => setFormData(prev => ({ ...prev, consultancy_services: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Details of Startups/Center of Excellence</label>
              <Textarea
                value={formData.startup_details}
                onChange={(e) => setFormData(prev => ({ ...prev, startup_details: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Research Area/Fields of Interest</label>
              <Textarea
                value={formData.research_area}
                onChange={(e) => setFormData(prev => ({ ...prev, research_area: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">General Remarks</label>
              <Textarea
                value={formData.general_remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, general_remarks: e.target.value }))}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : (isEditing ? "Update Achievement" : "Submit Achievement")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
