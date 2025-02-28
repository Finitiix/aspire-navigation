import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

type FormData = {
  // Personal details
  eid: string;
  full_name: string;
  designation: string;
  department: string;
  mobile_no: string;

  // Research papers
  sci_papers_count: string;
  scopus_papers_count: string;
  scopus_id_link: string;
  ugc_papers_count: string;
  google_scholar_link: string;
  research_remarks: string;

  // Books
  book_drive_link: string;
  book_details: string;
  indexed_book_chapters: string;

  // Journal papers
  q1_q2_papers_count: string;
  q1_q2_papers_link: string;

  // Patents
  patents_count: string;
  patent_link: string;
  patent_remarks: string;

  // Other achievements
  research_collaboration: string;
  awards_achievements: string;
  consultancy_services: string;
  funded_projects: string;
  startups_coe: string;
  research_areas: string;
  general_remarks: string;
};

export const AchievementForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    // Personal details
    eid: '',
    full_name: '',
    designation: '',
    department: '',
    mobile_no: '',

    // Research papers
    sci_papers_count: '',
    scopus_papers_count: '',
    scopus_id_link: '',
    ugc_papers_count: '',
    google_scholar_link: '',
    research_remarks: '',

    // Books
    book_drive_link: '',
    book_details: '',
    indexed_book_chapters: '',

    // Journal papers
    q1_q2_papers_count: '',
    q1_q2_papers_link: '',

    // Patents
    patents_count: '',
    patent_link: '',
    patent_remarks: '',

    // Other achievements
    research_collaboration: '',
    awards_achievements: '',
    consultancy_services: '',
    funded_projects: '',
    startups_coe: '',
    research_areas: '',
    general_remarks: '',
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

        if (data) {
          setTeacherDetails(data);
          setFormData(prev => ({
            ...prev,
            eid: data.eid || '',
            full_name: data.full_name || '',
            designation: data.designation || '',
            department: data.department || '',
            mobile_no: data.mobile_no || '',
          }));
        }
      }
    };

    fetchTeacherDetails();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherDetails) {
      toast.error("Teacher details not found");
      return;
    }

    setLoading(true);
    try {
      // Chain .select() so that we receive the inserted record
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          // Teacher details
          teacher_id: teacherDetails.id,
          eid: formData.eid,
          full_name: formData.full_name,
          designation: formData.designation,
          department: formData.department,
          mobile_no: formData.mobile_no,

          // Research papers
          sci_papers_count: formData.sci_papers_count ? parseInt(formData.sci_papers_count) : null,
          scopus_papers_count: formData.scopus_papers_count ? parseInt(formData.scopus_papers_count) : null,
          scopus_id_link: formData.scopus_id_link || null,
          ugc_papers_count: formData.ugc_papers_count ? parseInt(formData.ugc_papers_count) : null,
          google_scholar_link: formData.google_scholar_link || null,
          research_remarks: formData.research_remarks || null,

          // Books
          book_drive_link: formData.book_drive_link || null,
          book_details: formData.book_details || null,
          indexed_book_chapters: formData.indexed_book_chapters || null,

          // Journal papers
          q1_q2_papers_count: formData.q1_q2_papers_count ? parseInt(formData.q1_q2_papers_count) : null,
          q1_q2_papers_link: formData.q1_q2_papers_link || null,

          // Patents
          patents_count: formData.patents_count ? parseInt(formData.patents_count) : null,
          patent_link: formData.patent_link || null,
          patent_remarks: formData.patent_remarks || null,

          // Other achievements
          research_collaboration: formData.research_collaboration || null,
          awards_achievements: formData.awards_achievements || null,
          consultancy_services: formData.consultancy_services || null,
          funded_projects: formData.funded_projects || null,
          startups_coe: formData.startups_coe || null,
          research_areas: formData.research_areas || null,
          general_remarks: formData.general_remarks || null,

          // Status
          status: 'pending',
        })
        .select();

      if (error) throw error;

      toast.success("Achievement submitted successfully!");
      
      // Reset form (keeping teacher details intact)
      setFormData(prev => ({
        ...{
          eid: prev.eid,
          full_name: prev.full_name,
          designation: prev.designation,
          department: prev.department,
          mobile_no: prev.mobile_no,
        },
        sci_papers_count: '',
        scopus_papers_count: '',
        scopus_id_link: '',
        ugc_papers_count: '',
        google_scholar_link: '',
        research_remarks: '',
        book_drive_link: '',
        book_details: '',
        indexed_book_chapters: '',
        q1_q2_papers_count: '',
        q1_q2_papers_link: '',
        patents_count: '',
        patent_link: '',
        patent_remarks: '',
        research_collaboration: '',
        awards_achievements: '',
        consultancy_services: '',
        funded_projects: '',
        startups_coe: '',
        research_areas: '',
        general_remarks: '',
      }));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit achievement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Achievement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">EID</label>
                <Input 
                  value={formData.eid} 
                  onChange={(e) => handleInputChange('eid', e.target.value)}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={formData.full_name} 
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Designation</label>
                <Input 
                  value={formData.designation} 
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Input 
                  value={formData.department} 
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile No.</label>
                <Input 
                  value={formData.mobile_no} 
                  onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Research Papers Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Research Papers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Papers in SCI</label>
                <Input 
                  type="number" 
                  value={formData.sci_papers_count} 
                  onChange={(e) => handleInputChange('sci_papers_count', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Papers in Scopus</label>
                <Input 
                  type="number" 
                  value={formData.scopus_papers_count} 
                  onChange={(e) => handleInputChange('scopus_papers_count', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Scopus ID Link</label>
                <Input 
                  placeholder="https://" 
                  value={formData.scopus_id_link} 
                  onChange={(e) => handleInputChange('scopus_id_link', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Papers in UGC Approved Journals</label>
                <Input 
                  type="number" 
                  value={formData.ugc_papers_count} 
                  onChange={(e) => handleInputChange('ugc_papers_count', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Google Scholar Link</label>
                <Input 
                  placeholder="https://" 
                  value={formData.google_scholar_link} 
                  onChange={(e) => handleInputChange('google_scholar_link', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Remark / Any Other Research Achievement</label>
                <Textarea 
                  placeholder="Optional remarks" 
                  value={formData.research_remarks} 
                  onChange={(e) => handleInputChange('research_remarks', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Books & Book Chapters Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Books & Book Chapters</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">BOOK DRIVE LINK with ISBN Number</label>
                <Input 
                  placeholder="https://" 
                  value={formData.book_drive_link} 
                  onChange={(e) => handleInputChange('book_drive_link', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Book Details</label>
                <Textarea 
                  placeholder="Title, publisher, year, etc." 
                  value={formData.book_details} 
                  onChange={(e) => handleInputChange('book_details', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">WOS / SCOPUS Indexed BOOK Chapters</label>
                <Textarea 
                  placeholder="Details of indexed book chapters" 
                  value={formData.indexed_book_chapters} 
                  onChange={(e) => handleInputChange('indexed_book_chapters', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Journal Papers Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Journal Papers</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Papers Published in Q1 / Q2 Journals</label>
                <Input 
                  type="number" 
                  value={formData.q1_q2_papers_count} 
                  onChange={(e) => handleInputChange('q1_q2_papers_count', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Q1 / Q2 Journals Links</label>
                <Textarea 
                  placeholder="Links to papers published in Q1/Q2 journals" 
                  value={formData.q1_q2_papers_link} 
                  onChange={(e) => handleInputChange('q1_q2_papers_link', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Patents Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Patents</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">No. of Patents (filed / published / granted / tech transfer)</label>
                <Input 
                  type="number" 
                  value={formData.patents_count} 
                  onChange={(e) => handleInputChange('patents_count', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Patent Link</label>
                <Input 
                  placeholder="https://" 
                  value={formData.patent_link} 
                  onChange={(e) => handleInputChange('patent_link', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks about Patents</label>
                <Textarea 
                  placeholder="Status details, technology, etc." 
                  value={formData.patent_remarks} 
                  onChange={(e) => handleInputChange('patent_remarks', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Other Achievements Section */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Other Achievements</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Any Research Collaboration</label>
                <Textarea 
                  placeholder="Details of research collaborations" 
                  value={formData.research_collaboration} 
                  onChange={(e) => handleInputChange('research_collaboration', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Awards/Achievements/Recognitions (govt. / non govt)</label>
                <Textarea 
                  placeholder="List of awards and recognitions" 
                  value={formData.awards_achievements} 
                  onChange={(e) => handleInputChange('awards_achievements', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Details of Any Consultancy Services</label>
                <Textarea 
                  placeholder="Consultancy services provided" 
                  value={formData.consultancy_services} 
                  onChange={(e) => handleInputChange('consultancy_services', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Funded Projects</label>
                <Textarea 
                  placeholder="Details of funded projects" 
                  value={formData.funded_projects} 
                  onChange={(e) => handleInputChange('funded_projects', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Details of Startups / Center of Excellence</label>
                <Textarea 
                  placeholder="Startups or centers of excellence" 
                  value={formData.startups_coe} 
                  onChange={(e) => handleInputChange('startups_coe', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Research Area / Fields of Interest</label>
                <Textarea 
                  placeholder="Research areas and interests" 
                  value={formData.research_areas} 
                  onChange={(e) => handleInputChange('research_areas', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">General Remarks</label>
                <Textarea 
                  placeholder="Any additional information" 
                  value={formData.general_remarks} 
                  onChange={(e) => handleInputChange('general_remarks', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Submit Achievement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
