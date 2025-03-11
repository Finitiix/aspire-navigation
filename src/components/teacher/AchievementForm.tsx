import { useState, useEffect, useRef } from "react";
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
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Database } from "@/integrations/supabase/types";

type AchievementCategory = Database["public"]["Enums"]["achievement_category"];

// Define category options
const categoryOptions: AchievementCategory[] = [
  'Journal Articles',
  'Conference Papers',
  'Books & Book Chapters',
  'Patents',
  'Research Collaborations',
  'Awards & Recognitions',
  'Consultancy & Funded Projects',
  'Startups & Centers of Excellence',
  'Others'
];

// Define indexed in options
const indexedInOptions = [
  'SCI', 'Scopus', 'UGC Approved', 'WOS', 'IEEE Xplore', 
  'Springer', 'Elsevier', 'ACM'
];

// Define Q-Ranking options
const qRankingOptions = ['Q1', 'Q2', 'Q3', 'Q4'];

// Define patent office options
const patentOfficeOptions = ['USPTO', 'EPO', 'IPO', 'Others'];

// Define patent status options
const patentStatusOptions = ['Filed', 'Published', 'Granted', 'Tech Transfer'];

// Define award type options
const awardTypeOptions = ['Govt.', 'Non-Govt.'];

// Define project status options
const projectStatusOptions = ['Ongoing', 'Completed'];

interface AchievementFormProps {
  onSuccess?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export const AchievementForm = ({ onSuccess, initialData, isEditing = false }: AchievementFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [achievement, setAchievement] = useState({
    category: initialData?.category || '',
    title: initialData?.title || '',

    // Journal Articles
    journal_name: initialData?.journal_name || '',
    issn: initialData?.issn || '',
    doi: initialData?.doi || '',
    publisher: initialData?.publisher || '',
    indexed_in: initialData?.indexed_in || [],
    q_ranking: initialData?.q_ranking || '',
    journal_link: initialData?.journal_link || '',

    // Conference Papers
    conference_name: initialData?.conference_name || '',
    proceedings_publisher: initialData?.proceedings_publisher || '',
    isbn: initialData?.isbn || '',
    paper_link: initialData?.paper_link || '',

    // Books & Book Chapters
    book_title: initialData?.book_title || '',
    chapter_title: initialData?.chapter_title || '',
    book_drive_link: initialData?.book_drive_link || '',

    // Patents
    patent_number: initialData?.patent_number || '',
    patent_office: initialData?.patent_office || '',
    patent_status: initialData?.patent_status || '',
    patent_link: initialData?.patent_link || '',

    // Research Collaborations
    partner_institutions: initialData?.partner_institutions || '',
    research_area: initialData?.research_area || '',
    collaboration_details: initialData?.collaboration_details || '',

    // Awards & Recognitions
    award_name: initialData?.award_name || '',
    awarding_body: initialData?.awarding_body || '',
    award_type: initialData?.award_type || '',
    certificate_link: initialData?.certificate_link || '',

    // Consultancy & Funded Projects
    client_organization: initialData?.client_organization || '',
    project_title: initialData?.project_title || '',
    funding_agency: initialData?.funding_agency || '',
    funding_amount: initialData?.funding_amount || '',
    project_status: initialData?.project_status || '',
    project_details_link: initialData?.project_details_link || '',

    // Startups & Centers of Excellence
    startup_center_name: initialData?.startup_center_name || '',
    domain: initialData?.domain || '',
    funding_details: initialData?.funding_details || '',
    website_link: initialData?.website_link || '',

    // Others
    description: initialData?.description || '',
    organization: initialData?.organization || '',
    proof_link: initialData?.proof_link || '',

    // Common fields
    remarks: initialData?.remarks || '',
    document_url: initialData?.document_url || '',
  });

  // Multiple date state
  const [dateAchieved, setDateAchieved] = useState<Date | undefined>(
    initialData?.date_achieved ? new Date(initialData.date_achieved) : undefined
  );
  const [conferenceDate, setConferenceDate] = useState<Date | undefined>(
    initialData?.conference_date ? new Date(initialData.conference_date) : undefined
  );
  const [yearOfPublication, setYearOfPublication] = useState<Date | undefined>(
    initialData?.year_of_publication ? new Date(initialData.year_of_publication) : undefined
  );
  const [filingDate, setFilingDate] = useState<Date | undefined>(
    initialData?.filing_date ? new Date(initialData.filing_date) : undefined
  );
  const [grantDate, setGrantDate] = useState<Date | undefined>(
    initialData?.grant_date ? new Date(initialData.grant_date) : undefined
  );
  const [projectStartDate, setProjectStartDate] = useState<Date | undefined>(
    initialData?.project_duration_start ? new Date(initialData.project_duration_start) : undefined
  );
  const [projectEndDate, setProjectEndDate] = useState<Date | undefined>(
    initialData?.project_duration_end ? new Date(initialData.project_duration_end) : undefined
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleChange = (field: string, value: any) => {
    setAchievement(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    setAchievement(prev => {
      const currentIndexed = [...(prev.indexed_in || [])];

      if (checked) {
        if (!currentIndexed.includes(option)) {
          return { ...prev, indexed_in: [...currentIndexed, option] };
        }
      } else {
        return { ...prev, indexed_in: currentIndexed.filter(item => item !== option) };
      }

      return prev;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    if (!teacherDetails) {
      toast.error("Teacher details not found");
      return;
    }

    setUploadingFile(true);
    try {
      // Create safe folder name from teacher's name
      const folderName = teacherDetails.full_name.replace(/[^a-zA-Z0-9]/g, "_");

      // Sanitize filename
      const fileExt = file.name.split('.').pop();
      const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const filePath = `${folderName}/${timestamp}_${fileName}`;

      // Upload to the new "teacher_proofs" bucket
      const { data, error } = await supabase.storage
        .from('teacher_proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('teacher_proofs')
        .getPublicUrl(filePath);

      handleChange('document_url', urlData.publicUrl);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      toast.error(`Error uploading file: ${error.message || "Unknown error"}`);
      console.error("Upload error:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  const validateForm = () => {
    if (!achievement.category) {
      toast.error("Please select an achievement category");
      return false;
    }

    if (!achievement.title) {
      toast.error("Please enter a title");
      return false;
    }

    if (!dateAchieved) {
      toast.error("Please select a date");
      return false;
    }

    // Check if a document has been uploaded
    if (!achievement.document_url) {
      toast.error("Please upload a proof document");
      return false;
    }

    // Validate required fields based on category with more strict validation
    switch (achievement.category) {
      case 'Journal Articles':
        if (!achievement.journal_name || !achievement.publisher) {
          toast.error("Please fill in all required fields for Journal Articles");
          return false;
        }
        if (!achievement.doi) {
          toast.error("DOI is required for Journal Articles");
          return false;
        }
        if (!achievement.issn) {
          toast.error("ISSN is required for Journal Articles");
          return false;
        }
        if (!achievement.journal_link) {
          toast.error("Journal Link is required for Journal Articles");
          return false;
        }
        if (!achievement.q_ranking) {
          toast.error("Q-Ranking is required for Journal Articles");
          return false;
        }
        break;
      case 'Conference Papers':
        if (!achievement.conference_name || !conferenceDate) {
          toast.error("Please fill in all required fields for Conference Papers");
          return false;
        }
        if (!achievement.doi) {
          toast.error("DOI is required for Conference Papers");
          return false;
        }
        if (!achievement.isbn) {
          toast.error("ISBN is required for Conference Papers");
          return false;
        }
        if (!achievement.q_ranking) {
          toast.error("Q-Ranking is required for Conference Papers");
          return false;
        }
        break;
      case 'Books & Book Chapters':
        if (!achievement.book_title || !yearOfPublication) {
          toast.error("Please fill in all required fields for Books & Book Chapters");
          return false;
        }
        if (!achievement.isbn) {
          toast.error("ISBN is required for Books & Book Chapters");
          return false;
        }
        if (!achievement.q_ranking) {
          toast.error("Q-Ranking is required for Books & Book Chapters");
          return false;
        }
        break;
      case 'Patents':
        if (!achievement.patent_number || !filingDate || !achievement.patent_status) {
          toast.error("Please fill in all required fields for Patents");
          return false;
        }
        break;
      case 'Research Collaborations':
        if (!achievement.partner_institutions || !achievement.research_area) {
          toast.error("Please fill in all required fields for Research Collaborations");
          return false;
        }
        break;
      case 'Awards & Recognitions':
        if (!achievement.award_name || !achievement.awarding_body) {
          toast.error("Please fill in all required fields for Awards & Recognitions");
          return false;
        }
        break;
      case 'Consultancy & Funded Projects':
        if (!achievement.project_title || !achievement.funding_agency || !projectStartDate) {
          toast.error("Please fill in all required fields for Consultancy & Funded Projects");
          return false;
        }
        break;
      case 'Startups & Centers of Excellence':
        if (!achievement.startup_center_name || !achievement.domain) {
          toast.error("Please fill in all required fields for Startups & Centers of Excellence");
          return false;
        }
        break;
      case 'Others':
        if (!achievement.description) {
          toast.error("Please provide a description");
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !teacherDetails || !dateAchieved) {
      return;
    }

    setLoading(true);
    try {
      const achievementData = {
        teacher_id: teacherDetails.id,
        category: achievement.category as AchievementCategory,
        title: achievement.title,
        date_achieved: format(dateAchieved, 'yyyy-MM-dd'),

        // Teacher details (auto-filled, read-only)
        teacher_name: teacherDetails.full_name,
        teacher_eid: teacherDetails.eid,
        teacher_designation: teacherDetails.designation,
        teacher_mobile: teacherDetails.mobile_number,
        teacher_department: teacherDetails.department,

        // Common fields
        remarks: achievement.remarks || null,
        document_url: achievement.document_url || null,

        // Journal Articles fields
        journal_name: achievement.category === 'Journal Articles' ? achievement.journal_name : null,
        issn: achievement.category === 'Journal Articles' ? achievement.issn : null,
        doi: achievement.category === 'Journal Articles' || achievement.category === 'Conference Papers' ? achievement.doi : null,
        publisher: achievement.category === 'Journal Articles' || achievement.category === 'Books & Book Chapters' ? achievement.publisher : null,
        indexed_in: ['Journal Articles', 'Conference Papers', 'Books & Book Chapters'].includes(achievement.category) ? achievement.indexed_in : null,
        q_ranking: ['Journal Articles', 'Conference Papers', 'Books & Book Chapters'].includes(achievement.category) ? achievement.q_ranking : null,
        journal_link: achievement.category === 'Journal Articles' ? achievement.journal_link : null,

        // Conference Papers fields
        conference_name: achievement.category === 'Conference Papers' ? achievement.conference_name : null,
        conference_date: achievement.category === 'Conference Papers' && conferenceDate ? format(conferenceDate, 'yyyy-MM-dd') : null,
        proceedings_publisher: achievement.category === 'Conference Papers' ? achievement.proceedings_publisher : null,
        paper_link: achievement.category === 'Conference Papers' ? achievement.paper_link : null,

        // Books & Book Chapters fields
        book_title: achievement.category === 'Books & Book Chapters' ? achievement.book_title : null,
        chapter_title: achievement.category === 'Books & Book Chapters' ? achievement.chapter_title : null,
        book_drive_link: achievement.category === 'Books & Book Chapters' ? achievement.book_drive_link : null,
        year_of_publication: achievement.category === 'Books & Book Chapters' && yearOfPublication ? format(yearOfPublication, 'yyyy-MM-dd') : null,
        isbn: achievement.category === 'Books & Book Chapters' || achievement.category === 'Conference Papers' ? achievement.isbn : null,

        // Patents fields
        patent_number: achievement.category === 'Patents' ? achievement.patent_number : null,
        patent_office: achievement.category === 'Patents' ? achievement.patent_office : null,
        filing_date: achievement.category === 'Patents' && filingDate ? format(filingDate, 'yyyy-MM-dd') : null,
        grant_date: achievement.category === 'Patents' && grantDate ? format(grantDate, 'yyyy-MM-dd') : null,
        patent_status: achievement.category === 'Patents' ? achievement.patent_status : null,
        patent_link: achievement.category === 'Patents' ? achievement.patent_link : null,

        // Research Collaborations fields
        partner_institutions: achievement.category === 'Research Collaborations' ? achievement.partner_institutions : null,
        research_area: achievement.category === 'Research Collaborations' ? achievement.research_area : null,
        collaboration_details: achievement.category === 'Research Collaborations' ? achievement.collaboration_details : null,

        // Awards & Recognitions fields
        award_name: achievement.category === 'Awards & Recognitions' ? achievement.award_name : null,
        awarding_body: achievement.category === 'Awards & Recognitions' ? achievement.awarding_body : null,
        award_type: achievement.category === 'Awards & Recognitions' ? achievement.award_type : null,
        certificate_link: achievement.category === 'Awards & Recognitions' ? achievement.certificate_link : null,

        // Consultancy & Funded Projects fields
        client_organization: achievement.category === 'Consultancy & Funded Projects' ? achievement.client_organization : null,
        project_title: achievement.category === 'Consultancy & Funded Projects' ? achievement.project_title : null,
        funding_agency: achievement.category === 'Consultancy & Funded Projects' ? achievement.funding_agency : null,
        funding_amount: achievement.category === 'Consultancy & Funded Projects' && achievement.funding_amount ? parseFloat(achievement.funding_amount) : null,
        project_duration_start: achievement.category === 'Consultancy & Funded Projects' && projectStartDate ? format(projectStartDate, 'yyyy-MM-dd') : null,
        project_duration_end: achievement.category === 'Consultancy & Funded Projects' && projectEndDate ? format(projectEndDate, 'yyyy-MM-dd') : null,
        project_status: achievement.category === 'Consultancy & Funded Projects' ? achievement.project_status : null,
        project_details_link: achievement.category === 'Consultancy & Funded Projects' ? achievement.project_details_link : null,

        // Startups & Centers of Excellence fields
        startup_center_name: achievement.category === 'Startups & Centers of Excellence' ? achievement.startup_center_name : null,
        domain: achievement.category === 'Startups & Centers of Excellence' ? achievement.domain : null,
        funding_details: achievement.category === 'Startups & Centers of Excellence' ? achievement.funding_details : null,
        website_link: achievement.category === 'Startups & Centers of Excellence' ? achievement.website_link : null,

        // Others fields
        description: achievement.category === 'Others' ? achievement.description : null,
        organization: achievement.category === 'Others' ? achievement.organization : null,
        proof_link: achievement.category === 'Others' ? achievement.proof_link : null,

        // Status
        status: isEditing && initialData?.status ? initialData.status : 'Pending Approval',
      };

      if (isEditing && initialData?.id) {
        // Update existing achievement
        const { error } = await supabase
          .from('detailed_achievements')
          .update(achievementData)
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success("Achievement updated successfully!");
      } else {
        // Insert new achievement
        const { error } = await supabase
          .from('detailed_achievements')
          .insert(achievementData);

        if (error) throw error;
        toast.success("Achievement submitted successfully!");
      }

      // Reset form for new submissions
      if (!isEditing) {
        setAchievement({
          category: '',
          title: '',
          journal_name: '',
          issn: '',
          doi: '',
          publisher: '',
          indexed_in: [],
          q_ranking: '',
          journal_link: '',
          conference_name: '',
          proceedings_publisher: '',
          isbn: '',
          paper_link: '',
          book_title: '',
          chapter_title: '',
          book_drive_link: '',
          patent_number: '',
          patent_office: '',
          patent_status: '',
          patent_link: '',
          partner_institutions: '',
          research_area: '',
          collaboration_details: '',
          award_name: '',
          awarding_body: '',
          award_type: '',
          certificate_link: '',
          client_organization: '',
          project_title: '',
          funding_agency: '',
          funding_amount: '',
          project_status: '',
          project_details_link: '',
          startup_center_name: '',
          domain: '',
          funding_details: '',
          website_link: '',
          description: '',
          organization: '',
          proof_link: '',
          remarks: '',
          document_url: '',
        });
        setDateAchieved(undefined);
        setConferenceDate(undefined);
        setYearOfPublication(undefined);
        setFilingDate(undefined);
        setGrantDate(undefined);
        setProjectStartDate(undefined);
        setProjectEndDate(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit achievement");
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderDatePicker = (label: string, date: Date | undefined, onChange: (date: Date | undefined) => void) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label} *</label>
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
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  const renderFileUpload = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Upload File (Proof) *</label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          disabled={uploadingFile}
          className="flex-1"
        />
        {uploadingFile && <Loader2 className="animate-spin h-5 w-5" />}
      </div>
      {achievement.document_url && (
        <div className="text-sm text-blue-600 mt-1">
          <a href={achievement.document_url} target="_blank" rel="noopener noreferrer">
            View Uploaded File
          </a>
        </div>
      )}
    </div>
  );

  const renderIndexedInCheckboxes = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Indexed In *</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {indexedInOptions.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`indexed-${option}`}
              checked={(achievement.indexed_in || []).includes(option)}
              onCheckedChange={(checked) => handleCheckboxChange(option, checked === true)}
            />
            <Label htmlFor={`indexed-${option}`}>{option}</Label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategoryFields = () => {
    switch (achievement.category) {
      case 'Journal Articles':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Journal Name *</label>
                <Input
                  value={achievement.journal_name}
                  onChange={(e) => handleChange('journal_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ISSN *</label>
                <Input
                  value={achievement.issn}
                  onChange={(e) => handleChange('issn', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">DOI *</label>
                <Input
                  value={achievement.doi}
                  onChange={(e) => handleChange('doi', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Publisher *</label>
                <Input
                  value={achievement.publisher}
                  onChange={(e) => handleChange('publisher', e.target.value)}
                  required
                />
              </div>
            </div>

            {renderIndexedInCheckboxes()}

            <div className="space-y-2">
              <label className="text-sm font-medium">Q-Ranking *</label>
              <Select
                value={achievement.q_ranking}
                onValueChange={(value) => handleChange('q_ranking', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Q-Ranking" />
                </SelectTrigger>
                <SelectContent>
                  {qRankingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Journal Link *</label>
              <Input
                type="url"
                value={achievement.journal_link}
                onChange={(e) => handleChange('journal_link', e.target.value)}
                placeholder="https://"
                required
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Conference Papers':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Conference Name *</label>
                <Input
                  value={achievement.conference_name}
                  onChange={(e) => handleChange('conference_name', e.target.value)}
                  required
                />
              </div>

              {renderDatePicker("Conference Date", conferenceDate, setConferenceDate)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Proceedings Publisher</label>
                <Input
                  value={achievement.proceedings_publisher}
                  onChange={(e) => handleChange('proceedings_publisher', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">DOI *</label>
                <Input
                  value={achievement.doi}
                  onChange={(e) => handleChange('doi', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ISBN *</label>
              <Input
                value={achievement.isbn}
                onChange={(e) => handleChange('isbn', e.target.value)}
                required
              />
            </div>

            {renderIndexedInCheckboxes()}

            <div className="space-y-2">
              <label className="text-sm font-medium">Q-Ranking *</label>
              <Select
                value={achievement.q_ranking}
                onValueChange={(value) => handleChange('q_ranking', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Q-Ranking" />
                </SelectTrigger>
                <SelectContent>
                  {qRankingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Link</label>
              <Input
                type="url"
                value={achievement.paper_link}
                onChange={(e) => handleChange('paper_link', e.target.value)}
                placeholder="https://"
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Books & Book Chapters':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Book Title *</label>
                <Input
                  value={achievement.book_title}
                  onChange={(e) => handleChange('book_title', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Chapter Title</label>
                <Input
                  value={achievement.chapter_title}
                  onChange={(e) => handleChange('chapter_title', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Publisher *</label>
                <Input
                  value={achievement.publisher}
                  onChange={(e) => handleChange('publisher', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ISBN *</label>
                <Input
                  value={achievement.isbn}
                  onChange={(e) => handleChange('isbn', e.target.value)}
                  required
                />
              </div>
            </div>

            {renderDatePicker("Year of Publication", yearOfPublication, setYearOfPublication)}

            <div className="space-y-2">
              <label className="text-sm font-medium">Book Drive Link</label>
              <Input
                type="url"
                value={achievement.book_drive_link}
                onChange={(e) => handleChange('book_drive_link', e.target.value)}
                placeholder="https://"
              />
            </div>

            {renderIndexedInCheckboxes()}

            <div className="space-y-2">
              <label className="text-sm font-medium">Q-Ranking *</label>
              <Select
                value={achievement.q_ranking}
                onValueChange={(value) => handleChange('q_ranking', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Q-Ranking" />
                </SelectTrigger>
                <SelectContent>
                  {qRankingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Patents':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patent Number *</label>
                <Input
                  value={achievement.patent_number}
                  onChange={(e) => handleChange('patent_number', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Patent Office *</label>
                <Select
                  value={achievement.patent_office}
                  onValueChange={(value) => handleChange('patent_office', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Patent Office" />
                  </SelectTrigger>
                  <SelectContent>
                    {patentOfficeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDatePicker("Filing Date", filingDate, setFilingDate)}
              {renderDatePicker("Grant Date", grantDate, setGrantDate)}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status *</label>
              <Select
                value={achievement.patent_status}
                onValueChange={(value) => handleChange('patent_status', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {patentStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Patent Link</label>
              <Input
                type="url"
                value={achievement.patent_link}
                onChange={(e) => handleChange('patent_link', e.target.value)}
                placeholder="https://"
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Research Collaborations':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner Institution(s) *</label>
              <Input
                value={achievement.partner_institutions}
                onChange={(e) => handleChange('partner_institutions', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Research Area *</label>
              <Input
                value={achievement.research_area}
                onChange={(e) => handleChange('research_area', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Collaboration Details</label>
              <Textarea
                value={achievement.collaboration_details}
                onChange={(e) => handleChange('collaboration_details', e.target.value)}
                rows={4}
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Awards & Recognitions':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Award Name *</label>
                <Input
                  value={achievement.award_name}
                  onChange={(e) => handleChange('award_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Awarding Body *</label>
                <Input
                  value={achievement.awarding_body}
                  onChange={(e) => handleChange('awarding_body', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type *</label>
              <Select
                value={achievement.award_type}
                onValueChange={(value) => handleChange('award_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {awardTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Certificate/Proof Link</label>
              <Input
                type="url"
                value={achievement.certificate_link}
                onChange={(e) => handleChange('certificate_link', e.target.value)}
                placeholder="https://"
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Consultancy & Funded Projects':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Client/Organization</label>
                <Input
                  value={achievement.client_organization}
                  onChange={(e) => handleChange('client_organization', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Title *</label>
                <Input
                  value={achievement.project_title}
                  onChange={(e) => handleChange('project_title', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Funding Agency *</label>
                <Input
                  value={achievement.funding_agency}
                  onChange={(e) => handleChange('funding_agency', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Funding Amount</label>
                <Input
                  type="number"
                  value={achievement.funding_amount}
                  onChange={(e) => handleChange('funding_amount', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderDatePicker("Project Start Date", projectStartDate, setProjectStartDate)}
              {renderDatePicker("Project End Date", projectEndDate, setProjectEndDate)}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Status</label>
              <Select
                value={achievement.project_status}
                onValueChange={(value) => handleChange('project_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Details Link</label>
              <Input
                type="url"
                value={achievement.project_details_link}
                onChange={(e) => handleChange('project_details_link', e.target.value)}
                placeholder="https://"
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Startups & Centers of Excellence':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Startup/Center Name *</label>
              <Input
                value={achievement.startup_center_name}
                onChange={(e) => handleChange('startup_center_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Domain *</label>
              <Input
                value={achievement.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Funding Details</label>
              <Textarea
                value={achievement.funding_details}
                onChange={(e) => handleChange('funding_details', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website Link</label>
              <Input
                type="url"
                value={achievement.website_link}
                onChange={(e) => handleChange('website_link', e.target.value)}
                placeholder="https://"
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      case 'Others':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={achievement.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <Input
                value={achievement.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Proof Link</label>
              <Input
                type="url"
                value={achievement.proof_link}
                onChange={(e) => handleChange('proof_link', e.target.value)}
                placeholder="https://"
              />
            </div>

            {renderFileUpload()}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Achievement" : "Add New Achievement"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="border-t pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Achievement Category *</label>
                <Select
                  value={achievement.category}
                  onValueChange={(value) => handleChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select achievement category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={achievement.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              {renderDatePicker("Date of Achievement", dateAchieved, setDateAchieved)}
            </div>
          </div>

          {/* Category specific fields */}
          {achievement.category && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">{achievement.category} Details</h3>
              {renderCategoryFields()}
            </div>
          )}

          {/* Common fields for all types */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea
                value={achievement.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Any additional information..."
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
