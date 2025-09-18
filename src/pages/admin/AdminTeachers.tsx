import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, X, Eye, ExternalLink, FileText, Trash, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PointsApprovalDialog } from "@/components/admin/PointsApprovalDialog";
import { format as dateFormat } from "date-fns";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

// -----------------------
// TYPE DEFINITIONS
// -----------------------
type DetailedAchievement = {
  id: string;
  category: string;
  title: string;
  date_achieved: string;
  remarks?: string;
  document_url?: string;
  status: string;
  // Teacher details (auto-populated in achievement record)
  teacher_name: string;
  teacher_eid: string;
  teacher_designation: string;
  teacher_mobile: string;
  teacher_department: string;
  // Journal Articles
  journal_name?: string;
  issn?: string;
  doi?: string;
  publisher?: string;
  indexed_in?: string[];
  q_ranking?: string;
  journal_link?: string;
  // Conference Papers
  conference_name?: string;
  conference_date?: string;
  proceedings_publisher?: string;
  isbn?: string;
  paper_link?: string;
  // Books & Book Chapters
  book_title?: string;
  chapter_title?: string;
  year_of_publication?: string;
  book_drive_link?: string;
  // Patents
  patent_number?: string;
  patent_office?: string;
  filing_date?: string;
  grant_date?: string;
  patent_status?: string;
  patent_link?: string;
  // Research Collaborations
  partner_institutions?: string;
  research_area?: string;
  collaboration_details?: string;
  // Awards & Recognitions
  award_name?: string;
  awarding_body?: string;
  award_type?: string;
  certificate_link?: string;
  // Consultancy & Funded Projects
  client_organization?: string;
  project_title?: string;
  funding_agency?: string;
  funding_amount?: number;
  project_duration_start?: string;
  project_duration_end?: string;
  project_status?: string;
  project_details_link?: string;
  // Startups & Centers of Excellence
  startup_center_name?: string;
  domain?: string;
  funding_details?: string;
  website_link?: string;
  // Others
  description?: string;
  organization?: string;
  proof_link?: string;
  created_at?: string;
};

type Teacher = {
  id: string;
  full_name: string;
  email_id: string;
  department: string;
  designation: string;
  mobile_number: string;
  eid: string;
  profile_pic_url: string | null;
  // Additional teacher details
  gender?: string;
  date_of_joining?: string;
  highest_qualification?: string;
  skills?: string[];
  address?: string;
  cabin_no?: string;
  block?: string;
  created_at?: string;
  updated_at?: string;
  achievements?: DetailedAchievement[];
  [key: string]: any;
};

// -----------------------
// UTILITY FUNCTIONS
// -----------------------

// Helper function to replace all occurrences of a string
const replaceAll = (str: string, find: string, replace: string) => {
  return str.split(find).join(replace);
};

// Clean EID by removing spaces and '@' symbol
const cleanEid = (eid: string) => {
  return eid.replace(/\s+/g, '').replace(/@.*$/, '');
};

// Format email by cleaning EID and appending '@achievementhub.com'
const formatEmail = (eid: string) => {
  return `${cleanEid(eid).toLowerCase()}@achievementhub.com`;
};

// Format website URL
const formatWebsiteUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// Compute aggregated statistics for a teacher's achievements
const computeTeacherStats = (achievements: DetailedAchievement[]) => {
  const stats = {
    totalDocuments: achievements.length,
    indexed: {
      SCI: 0,
      Scopus: 0,
      "UGC Approved": 0,
      WOS: 0,
      "IEEE Xplore": 0,
      Springer: 0,
      Elsevier: 0,
    },
    categories: {
      "Journal Articles": 0,
      "Conference Papers": 0,
      "Books & Book Chapters": 0,
      "Patents": 0,
      "Research Collaborations": 0,
      "Awards & Recognitions": 0,
      "Consultancy & Funded Projects": 0,
      "Startups & Centers of Excellence": 0,
      "Others": 0,
    },
    yearly: {
      2022: 0,
      2023: 0,
      2024: 0,
      2025: 0,
    },
    quality: {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0,
    },
  };
  achievements.forEach((achievement) => {
    if (achievement.category && stats.categories[achievement.category] !== undefined) {
      stats.categories[achievement.category]++;
    }
    if (achievement.date_achieved) {
      const year = new Date(achievement.date_achieved).getFullYear();
      if ([2022, 2023, 2024, 2025].includes(year)) {
        stats.yearly[year]++;
      }
    }
    if (achievement.q_ranking && stats.quality[achievement.q_ranking] !== undefined) {
      stats.quality[achievement.q_ranking]++;
    }
    if (achievement.indexed_in && Array.isArray(achievement.indexed_in)) {
      achievement.indexed_in.forEach((index: string) => {
        if (stats.indexed[index] !== undefined) {
          stats.indexed[index]++;
        }
      });
    }
  });
  return stats;
};

// Ensure URLs include a protocol.
const ensureValidUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// -----------------------
// MAIN COMPONENT
// -----------------------
const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<DetailedAchievement | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");

  // Modal state for Teacher Document Statistics (interactive filtering)
  const [teacherStatModalOpen, setTeacherStatModalOpen] = useState(false);
  const [teacherStatModalFilter, setTeacherStatModalFilter] = useState<{ filterType: string; filterValue: any } | null>(null);
  
  // Points approval dialog state
  const [isPointsDialogOpen, setIsPointsDialogOpen] = useState(false);
  const [selectedAchievementForPoints, setSelectedAchievementForPoints] = useState<{
    id: string;
    teacherId: string;
    teacherName: string;
  } | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    let filtered = teachers;
    
    if (searchQuery) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.email_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.eid.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (departmentFilter) {
      filtered = filtered.filter(teacher => teacher.department === departmentFilter);
    }
    
    if (designationFilter) {
      filtered = filtered.filter(teacher => teacher.designation === designationFilter);
    }
    
    setFilteredTeachers(filtered);
  }, [searchQuery, departmentFilter, designationFilter, teachers]);

  const fetchTeachers = async () => {
    try {
      // Retrieve the admin's department and super admin status from localStorage.
      const department = localStorage.getItem("admin_department");
      const isSuperAdmin = localStorage.getItem("is_super_admin");
      
      // Build the teacher_details query
      let teacherQuery = supabase.from("teacher_details").select("*");
      // If the admin is not a super admin, filter by department.
      if (!(isSuperAdmin && isSuperAdmin === "true")) {
        teacherQuery = teacherQuery.eq("department", department);
      }
      // Order the results.
      const { data: teachersData, error } = await teacherQuery.order("full_name");
      if (error) throw error;
      if (teachersData) {
        const teachersWithAchievements = await Promise.all(
          teachersData.map(async (teacher) => {
            // Build the detailed_achievements query for each teacher.
            let achievementQuery = supabase
              .from("detailed_achievements")
              .select("*")
              .eq("teacher_id", teacher.id);
            // If the admin is not a super admin, further filter achievements by teacher_department.
            if (!(isSuperAdmin && isSuperAdmin === "true")) {
              achievementQuery = achievementQuery.eq("teacher_department", department);
            }
            const { data: achievements } = await achievementQuery;
            return { ...teacher, achievements: achievements || [] };
          })
        );
        setTeachers(teachersWithAchievements);
        setFilteredTeachers(teachersWithAchievements);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to fetch teachers data");
    }
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailsOpen(true);
  };

  const handleViewDocument = (url: string) => {
    setViewDocumentUrl(url);
  };

  const renderFieldValue = (value: any, isLink = false) => {
    if (!value) return <span className="text-gray-400">Not provided</span>;
    if (isLink && typeof value === "string" && value.startsWith("http")) {
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

  const handleUpdateAchievementStatus = async (achievementId: string, newStatus: "Approved" | "Rejected") => {
    try {
      const { error } = await supabase
        .from("detailed_achievements")
        .update({ status: newStatus })
        .eq("id", achievementId);
      if (error) throw error;
      if (selectedTeacher) {
        const updatedAchievements = selectedTeacher.achievements?.map((a) =>
          a.id === achievementId ? { ...a, status: newStatus } : a
        );
        setSelectedTeacher({ ...selectedTeacher, achievements: updatedAchievements });
        setTeachers(
          teachers.map((t) =>
            t.id === selectedTeacher.id ? { ...t, achievements: updatedAchievements } : t
          )
        );
        setFilteredTeachers(
          filteredTeachers.map((t) =>
            t.id === selectedTeacher.id ? { ...t, achievements: updatedAchievements } : t
          )
        );
      }
      toast.success(`Achievement marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating achievement status:", error);
      toast.error("Failed to update achievement status");
    }
  };

  const openDeleteDialog = (achievement: DetailedAchievement) => {
    setAchievementToDelete(achievement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    try {
      const achievement = selectedTeacher?.achievements.find((a) => a.id === achievementId);
      if (achievement && achievement.document_url) {
        const regex = /teacher_proofs\/(.+)$/;
        const match = achievement.document_url.match(regex);
        const filePath = match ? match[1] : null;
        if (filePath) {
          const { error: storageError } = await supabase
            .storage
            .from("teacher_proofs")
            .remove([filePath]);
          if (storageError) {
            console.error("Error deleting file from bucket:", storageError);
            toast.error("Failed to delete file from storage");
            return;
          }
        }
      }
      const { error } = await supabase.from("detailed_achievements").delete().eq("id", achievementId);
      if (error) throw error;
      if (selectedTeacher) {
        const updatedAchievements = selectedTeacher.achievements.filter((a) => a.id !== achievementId);
        setSelectedTeacher({ ...selectedTeacher, achievements: updatedAchievements });
        setTeachers(
          teachers.map((t) =>
            t.id === selectedTeacher.id ? { ...t, achievements: updatedAchievements } : t
          )
        );
        setFilteredTeachers(
          filteredTeachers.map((t) =>
            t.id === selectedTeacher.id ? { ...t, achievements: updatedAchievements } : t
          )
        );
      }
      toast.success("Achievement and file deleted successfully");
    } catch (error) {
      console.error("Error deleting achievement:", error);
      toast.error("Failed to delete achievement");
    }
  };

  // Export CSV for achievements
  const exportCSV = () => {
    let achievementsToExport: DetailedAchievement[] = [];
  
    if (teacherStatModalOpen && teacherStatModalFilter && selectedTeacher) {
      // Export based on filtered achievements
      achievementsToExport = getFilteredTeacherAchievements();
    } else if (selectedTeacher) {
      // Export all achievements
      achievementsToExport = selectedTeacher.achievements || [];
    }
  
    if (!achievementsToExport.length) {
      toast.error("No data available to export.");
      return;
    }
  
    const headers = Object.keys(achievementsToExport[0]);
    const rows = achievementsToExport.map((achievement) =>
      headers.map((field) => `"${achievement[field] ?? ""}"`).join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "filtered_teacher_data.csv");
    link.click();
  };

  // Export teacher profiles as CSV
  const exportTeacherProfiles = async () => {
    try {
      const teachersToExport = filteredTeachers;
      
      if (!teachersToExport.length) {
        toast.error("No teachers to export");
        return;
      }

      // Fetch researcher IDs for all teachers
      const teachersWithResearcherIds = await Promise.all(
        teachersToExport.map(async (teacher) => {
          const { data: researcherIds } = await supabase
            .from('researcher_ids')
            .select('*')
            .eq('teacher_id', teacher.id)
            .single();

          return {
            name: teacher.full_name,
            eid: teacher.eid,
            department: teacher.department,
            email: teacher.email_id,
            mobile: teacher.mobile_number,
            designation: teacher.designation,
            date_of_joining: teacher.date_of_joining || '',
            qualification: teacher.highest_qualification || '',
            address: teacher.address || '',
            cabin: teacher.cabin_no || '',
            block: teacher.block || '',
            total_documents: teacher.achievements?.length || 0,
            google_scholar_id: researcherIds?.google_scholar_id || '',
            orcid: researcherIds?.orcid || '',
            scopus_author_id: researcherIds?.scopus_author_id || '',
            web_of_science_id: researcherIds?.web_of_science_id || ''
          };
        })
      );

      const headers = [
        'Name', 'EID', 'Department', 'Email', 'Mobile', 'Designation', 
        'Date of Joining', 'Qualification', 'Address', 'Cabin', 'Block', 
        'Total Documents', 'Google Scholar ID', 'ORCID', 'Scopus Author ID', 'Web of Science ID'
      ];
      
      const rows = teachersWithResearcherIds.map(teacher => [
        teacher.name, teacher.eid, teacher.department, teacher.email, teacher.mobile,
        teacher.designation, teacher.date_of_joining, teacher.qualification, teacher.address,
        teacher.cabin, teacher.block, teacher.total_documents, teacher.google_scholar_id,
        teacher.orcid, teacher.scopus_author_id, teacher.web_of_science_id
      ].map(field => `"${field}"`).join(','));

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'teacher_profiles.csv');
      link.click();
      
      toast.success('Teacher profiles exported successfully');
    } catch (error) {
      console.error('Error exporting teacher profiles:', error);
      toast.error('Failed to export teacher profiles');
    }
  };
  
  // ---------------------------
  // TEACHER DOCUMENT STATISTICS MODAL FUNCTIONALITY
  // ---------------------------
  const openTeacherStatModal = (filterType: string, filterValue: any) => {
    setTeacherStatModalFilter({ filterType, filterValue });
    setTeacherStatModalOpen(true);
  };

  const getFilteredTeacherAchievements = (): DetailedAchievement[] => {
    if (!teacherStatModalFilter || !selectedTeacher) return [];
    const { filterType, filterValue } = teacherStatModalFilter;
    if (filterType === "all") {
      return selectedTeacher.achievements || [];
    } else if (filterType === "indexed") {
      return (selectedTeacher.achievements || []).filter(
        (achievement) =>
          achievement.indexed_in && achievement.indexed_in.includes(filterValue)
      );
    } else if (filterType === "categories") {
      return (selectedTeacher.achievements || []).filter(
        (achievement) => achievement.category === filterValue
      );
    } else if (filterType === "yearly") {
      return (selectedTeacher.achievements || []).filter(
        (achievement) => new Date(achievement.date_achieved).getFullYear() === filterValue
      );
    } else if (filterType === "quality") {
      return (selectedTeacher.achievements || []).filter(
        (achievement) => achievement.q_ranking === filterValue
      );
    }
    return [];
  };

  // Export summary for teacher document statistics as CSV
  const exportTeacherSummary = () => {
    if (!selectedTeacher) return;
    const teacherStats = computeTeacherStats(selectedTeacher.achievements || []);
    const summaryRows = [
      ["Section", "Metric", "Value"],
      ["General", "Total Documents", teacherStats.totalDocuments],
      ["Indexed", "SCI", teacherStats.indexed.SCI],
      ["Indexed", "Scopus", teacherStats.indexed.Scopus],
      ["Indexed", "UGC Approved", teacherStats.indexed["UGC Approved"]],
      ["Indexed", "WOS", teacherStats.indexed.WOS],
      ["Indexed", "IEEE Xplore", teacherStats.indexed["IEEE Xplore"]],
      ["Indexed", "Springer", teacherStats.indexed.Springer],
      ["Indexed", "Elsevier", teacherStats.indexed.Elsevier],
      [],
      ["Yearly", "2022", teacherStats.yearly[2022]],
      ["Yearly", "2023", teacherStats.yearly[2023]],
      ["Yearly", "2024", teacherStats.yearly[2024]],
      ["Yearly", "2025", teacherStats.yearly[2025]],
      [],
      ["Quality", "Q1", teacherStats.quality.Q1],
      ["Quality", "Q2", teacherStats.quality.Q2],
      ["Quality", "Q3", teacherStats.quality.Q3],
      ["Quality", "Q4", teacherStats.quality.Q4],
      [],
      ["Categories", "Journal Articles", teacherStats.categories["Journal Articles"]],
      ["Categories", "Conference Papers", teacherStats.categories["Conference Papers"]],
      ["Categories", "Books & Book Chapters", teacherStats.categories["Books & Book Chapters"]],
      ["Categories", "Patents", teacherStats.categories["Patents"]],
      ["Categories", "Research Collaborations", teacherStats.categories["Research Collaborations"]],
      ["Categories", "Awards & Recognitions", teacherStats.categories["Awards & Recognitions"]],
      ["Categories", "Consultancy & Funded Projects", teacherStats.categories["Consultancy & Funded Projects"]],
      ["Categories", "Startups & Centers of Excellence", teacherStats.categories["Startups & Centers of Excellence"]],
      ["Categories", "Others", teacherStats.categories["Others"]],
    ];
    const csv = summaryRows.map((row) => row.join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "teacher_documents_summary.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------------------
  // NEW FUNCTION: Export Teachers Summary CSV
  // ---------------------------
  const exportTeachersSummary = () => {
    if (!teachers.length) {
      toast.error("No teacher data available to export.");
      return;
    }
    // Prepare headers as defined.
    const headers = [
      "EID",
      "Full Name",
      "Designation",
      "Department",
      "Total Documents",
      "Approved Documents",
      "SCI",
      "Scopus",
      "UGC Approved",
      "WOS",
      "IEEE Xplore",
      "Springer",
      "Elsevier",
      "2022",
      "2023",
      "2024",
      "2025",
      "Q1",
      "Q2",
      "Q3",
      "Q4",
      "Journal Articles",
      "Conference Papers",
      "Books & Book Chapters",
      "Patents",
      "Research Collaborations",
      "Awards & Recognitions",
      "Consultancy & Funded Projects",
      "Startups & Centers of Excellence",
      "Others",
    ];
    const rows = [headers];
    teachers.forEach((teacher) => {
      const teacherStats = computeTeacherStats(teacher.achievements || []);
      const approvedCount = (teacher.achievements || []).filter(a => a.status === "Approved").length;
      const row = [
        String(teacher.eid || ''),
        String(teacher.full_name || ''),
        String(teacher.designation || ''),
        String(teacher.department || ''),
        String(teacherStats.totalDocuments || 0),
        String(approvedCount || 0),
        String(teacherStats.indexed.SCI || 0),
        String(teacherStats.indexed.Scopus || 0),
        String(teacherStats.indexed["UGC Approved"] || 0),
        String(teacherStats.indexed.WOS || 0),
        String(teacherStats.indexed["IEEE Xplore"] || 0),
        String(teacherStats.indexed.Springer || 0),
        String(teacherStats.indexed.Elsevier || 0),
        String(teacherStats.yearly[2022] || 0),
        String(teacherStats.yearly[2023] || 0),
        String(teacherStats.yearly[2024] || 0),
        String(teacherStats.yearly[2025] || 0),
        String(teacherStats.quality.Q1 || 0),
        String(teacherStats.quality.Q2 || 0),
        String(teacherStats.quality.Q3 || 0),
        String(teacherStats.quality.Q4 || 0),
        String(teacherStats.categories["Journal Articles"] || 0),
        String(teacherStats.categories["Conference Papers"] || 0),
        String(teacherStats.categories["Books & Book Chapters"] || 0),
        String(teacherStats.categories["Patents"] || 0),
        String(teacherStats.categories["Research Collaborations"] || 0),
        String(teacherStats.categories["Awards & Recognitions"] || 0),
        String(teacherStats.categories["Consultancy & Funded Projects"] || 0),
        String(teacherStats.categories["Startups & Centers of Excellence"] || 0),
        String(teacherStats.categories["Others"] || 0),
      ];
      rows.push(row);
    });
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "teachers_summary.csv");
    link.click();
  };

  // Get unique departments and designations for filters
  const uniqueDepartments = [...new Set(teachers.map(t => t.department))];
  const uniqueDesignations = [...new Set(teachers.map(t => t.designation))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, EID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Designation</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
              >
                <option value="">All Designations</option>
                {uniqueDesignations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Export</Label>
              <Button 
                onClick={exportTeacherProfiles}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Teacher Profiles
              </Button>
            </div>
          </div>
          
          {/* Clear Filters */}
          {(searchQuery || departmentFilter || designationFilter) && (
            <div className="mt-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchQuery("");
                  setDepartmentFilter("");
                  setDesignationFilter("");
                }}
                className="text-sm"
              >
                <X className="mr-2 h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Teachers List ({filteredTeachers.length})</CardTitle>
            <div className="space-x-2">
              <Button onClick={exportTeachersSummary} variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" />
                Export Summary
              </Button>
              <Button onClick={exportTeacherProfiles} variant="outline" size="sm">
                <Download className="mr-1 h-4 w-4" />
                Export Teacher Profiles
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">EID</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Designation</th>
                  <th className="p-3 text-left">Achievements</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={teacher.profile_pic_url || "/placeholder.svg"}
                            alt={teacher.full_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          {teacher.full_name}
                        </div>
                      </td>
                      <td className="p-3">{teacher.eid}</td>
                      <td className="p-3">{teacher.department}</td>
                      <td className="p-3">{teacher.designation}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            Total: {teacher.achievements?.length || 0}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            Approved: {teacher.achievements?.filter(a => a.status === "Approved").length || 0}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            Pending: {teacher.achievements?.filter(a => a.status === "Pending Approval").length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(teacher)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-3 text-center text-gray-500">
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between w-full">
              <DialogTitle>Teacher Details</DialogTitle>
              <Button onClick={exportCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </DialogHeader>
          {selectedTeacher && (
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedTeacher.profile_pic_url || "/placeholder.svg"}
                    alt={selectedTeacher.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{selectedTeacher.full_name}</h3>
                    <p className="text-gray-600">{selectedTeacher.eid}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p>{selectedTeacher.email_id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Mobile</h3>
                    <p>{selectedTeacher.mobile_number}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Department</h3>
                    <p>{selectedTeacher.department}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Designation</h3>
                    <p>{selectedTeacher.designation}</p>
                  </div>
                </div>
              </div>

              {/* Additional Teacher Details */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium">Date of Joining</h4>
                    <p>
                      {selectedTeacher.date_of_joining
                        ? dateFormat(new Date(selectedTeacher.date_of_joining), "PPP")
                        : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Highest Qualification</h4>
                    <p>{selectedTeacher.highest_qualification || "Not provided"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Skills</h4>
                    <p>{selectedTeacher.skills ? selectedTeacher.skills.join(", ") : "Not provided"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p>{selectedTeacher.address || "Not provided"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Cabin No</h4>
                    <p>{selectedTeacher.cabin_no || "Not provided"}</p>
                  </div>
                  <div>
                    <h4 className="font-medium">Block</h4>
                    <p>{selectedTeacher.block || "Not provided"}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Teacher Document Statistics Section */}
              {selectedTeacher && (
                (() => {
                  const teacherStats = computeTeacherStats(selectedTeacher.achievements || []);
                  return (
                    <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                        <CardTitle className="text-2xl font-bold text-white">
                          Teacher Document Statistics
                        </CardTitle>
                        <div className="mt-2 space-x-2">
                          <Button variant="outline" size="sm" onClick={exportTeacherSummary}>
                            <Download className="w-4 h-4 mr-1" />
                            Export Summary
                          </Button>
                          <Button variant="outline" size="sm" onClick={exportTeacherProfiles}>
                            <Download className="w-4 h-4 mr-1" />
                            Export Teacher Profile
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        {/* Total Documents */}
                        <div className="grid grid-cols-1 gap-4 mb-6">
                          <div
                            className="bg-gray-50 p-4 rounded-lg border cursor-pointer"
                            onClick={() => openTeacherStatModal("all", "all")}
                          >
                            <h3 className="text-lg font-semibold text-gray-700 text-center">
                              Total Documents Uploaded
                            </h3>
                            <p className="text-3xl font-bold text-blue-600 text-center mt-2">
                              {teacherStats.totalDocuments}
                            </p>
                          </div>
                        </div>
                        {/* Indexed Documents */}
                        <div className="grid grid-cols-1 gap-4 mb-6">
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              Indexed Documents
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {Object.entries(teacherStats.indexed).map(([key, value]) => (
                                <Button
                                  key={key}
                                  variant="ghost"
                                  className="text-sm text-gray-700 underline"
                                  onClick={() => openTeacherStatModal("indexed", key)}
                                >
                                  {key}: {value}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Yearly Uploads */}
                        <div className="grid grid-cols-1 gap-4 mb-6">
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                              Yearly Uploads
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(teacherStats.yearly).map(([year, count]) => (
                                <Button
                                  key={year}
                                  variant="ghost"
                                  className="text-sm text-gray-700 underline"
                                  onClick={() => openTeacherStatModal("yearly", Number(year))}
                                >
                                  {year}: {count}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                        {/* Category Breakdown and Quality Ranking */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Category Breakdown */}
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                              Category Breakdown (Pie Chart)
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                <Pie
                                  data={Object.entries(teacherStats.categories).map(([name, value]) => ({
                                    name,
                                    value,
                                  }))}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  fill="#8884d8"
                                  label
                                >
                                  {Object.entries(teacherStats.categories).map((entry, index) => {
                                    const colors = [
                                      "#0088FE",
                                      "#00C49F",
                                      "#FFBB28",
                                      "#FF8042",
                                      "#AA336A",
                                      "#33AA77",
                                      "#7755AA",
                                      "#AA5577",
                                      "#55AA77",
                                    ];
                                    return (
                                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    );
                                  })}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4">
                              <h3 className="text-md font-semibold text-gray-700">Category Details</h3>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(teacherStats.categories).map(([cat, count]) => (
                                  <Button
                                    key={cat}
                                    variant="ghost"
                                    className="flex justify-between items-center p-2 border rounded bg-white text-sm text-gray-700 underline"
                                    onClick={() => openTeacherStatModal("categories", cat)}
                                  >
                                    <span>{cat}</span>
                                    <span className="font-bold text-blue-600">{count}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Quality Ranking */}
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
                              Quality Ranking (Q1 - Q4)
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={[
                                { quality: "Q1", count: teacherStats.quality["Q1"] },
                                { quality: "Q2", count: teacherStats.quality["Q2"] },
                                { quality: "Q3", count: teacherStats.quality["Q3"] },
                                { quality: "Q4", count: teacherStats.quality["Q4"] },
                              ]}>
                                <XAxis dataKey="quality" stroke="#333" />
                                <YAxis stroke="#333" />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-4">
                              <h3 className="text-md font-semibold text-gray-700">Quality Details</h3>
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                                  <Button
                                    key={q}
                                    variant="ghost"
                                    className="flex justify-between items-center p-2 border rounded bg-white text-sm text-gray-700 underline"
                                    onClick={() => openTeacherStatModal("quality", q)}
                                  >
                                    <span>{q}</span>
                                    <span className="font-bold">
                                      {teacherStats.quality[q as keyof typeof teacherStats.quality]}
                                    </span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()
              )}
              <Tabs defaultValue="all" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Achievements</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  {selectedTeacher.achievements && selectedTeacher.achievements.length > 0 ? (
                    <div className="space-y-3">
                      {selectedTeacher.achievements.map((achievement) => (
                        <Card key={achievement.id} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{achievement.title}</div>
                              <div className="text-sm text-gray-600">
                                {achievement.category} | {new Date(achievement.date_achieved).toLocaleDateString()}
                              </div>
                              {achievement.document_url && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2 flex items-center gap-1 text-blue-600"
                                  onClick={() => handleViewDocument(achievement.document_url)}
                                >
                                  <FileText className="h-4 w-4" />
                                  View Uploaded Proof
                                </Button>
                              )}
                              <Accordion type="single" collapsible className="w-full mt-2">
                                <AccordionItem value="details">
                                  <AccordionTrigger className="text-sm py-2">
                                    View Achievement Details
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                      {Object.entries(achievement).map(([key, value]) => {
                                        const excludedKeys = [
                                          "id",
                                          "teacher_id",
                                          "created_at",
                                          "status",
                                          "document_url",
                                          "teacher_name",
                                          "teacher_eid",
                                          "teacher_designation",
                                          "teacher_mobile",
                                          "teacher_department",
                                        ];
                                        if (excludedKeys.includes(key) || !value) return null;
                                        return (
                                          <div key={key}>
                                            <p className="text-sm font-medium capitalize">
                                               {key.replace(/_/g, " ")}:
                                            </p>
                                            <p className="text-sm">{String(value)}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                {achievement.status}
                              </span>
                              {achievement.status === "Pending Approval" && (
                                <>
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     className="bg-green-500 hover:bg-green-600 text-white"
                                     onClick={() => {
                                       setSelectedAchievementForPoints({
                                         id: achievement.id,
                                         teacherId: selectedTeacher?.id || "",
                                         teacherName: achievement.teacher_name
                                       });
                                       setIsPointsDialogOpen(true);
                                     }}
                                   >
                                     Approve
                                   </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={() => handleUpdateAchievementStatus(achievement.id, "Rejected")}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openDeleteDialog(achievement)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No achievements found</div>
                  )}
                </TabsContent>
                <TabsContent value="pending" className="mt-4">
                  {selectedTeacher.achievements && selectedTeacher.achievements.filter(a => a.status === "Pending Approval").length > 0 ? (
                    <div className="space-y-3">
                      {selectedTeacher.achievements
                        .filter(a => a.status === "Pending Approval")
                        .map((achievement) => (
                          <Card key={achievement.id} className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-sm text-gray-600">
                                  {achievement.category} | {new Date(achievement.date_achieved).toLocaleDateString()}
                                </div>
                                {achievement.document_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 flex items-center gap-1 text-blue-600"
                                    onClick={() => handleViewDocument(achievement.document_url)}
                                  >
                                    <FileText className="h-4 w-4" />
                                    View Uploaded Proof
                                  </Button>
                                )}
                                <Accordion type="single" collapsible className="w-full mt-2">
                                  <AccordionItem value="details">
                                    <AccordionTrigger className="text-sm py-2">
                                      View Achievement Details
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                        {Object.entries(achievement).map(([key, value]) => {
                                          const excludedKeys = [
                                            "id",
                                            "teacher_id",
                                            "created_at",
                                            "status",
                                            "document_url",
                                            "teacher_name",
                                            "teacher_eid",
                                            "teacher_designation",
                                            "teacher_mobile",
                                            "teacher_department",
                                          ];
                                          if (excludedKeys.includes(key) || !value) return null;
                                          return (
                                            <div key={key}>
                                              <p className="text-sm font-medium capitalize">
                                                 {key.replace(/_/g, " ")}:
                                              </p>
                                              <p className="text-sm">{String(value)}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => {
                                    setSelectedAchievementForPoints({
                                      id: achievement.id,
                                      teacherId: selectedTeacher?.id || "",
                                      teacherName: achievement.teacher_name
                                    });
                                    setIsPointsDialogOpen(true);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => handleUpdateAchievementStatus(achievement.id, "Rejected")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openDeleteDialog(achievement)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No pending achievements</div>
                  )}
                </TabsContent>
                <TabsContent value="approved" className="mt-4">
                  {selectedTeacher.achievements && selectedTeacher.achievements.filter(a => a.status === "Approved").length > 0 ? (
                    <div className="space-y-3">
                      {selectedTeacher.achievements
                        .filter(a => a.status === "Approved")
                        .map((achievement) => (
                          <Card key={achievement.id} className="p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-sm text-gray-600">
                                  {achievement.category} | {new Date(achievement.date_achieved).toLocaleDateString()}
                                </div>
                                {achievement.document_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2 flex items-center gap-1 text-blue-600"
                                    onClick={() => handleViewDocument(achievement.document_url)}
                                  >
                                    <FileText className="h-4 w-4" />
                                    View Uploaded Proof
                                  </Button>
                                )}
                                <Accordion type="single" collapsible className="w-full mt-2">
                                  <AccordionItem value="details">
                                    <AccordionTrigger className="text-sm py-2">
                                      View Achievement Details
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                        {Object.entries(achievement).map(([key, value]) => {
                                          const excludedKeys = [
                                            "id",
                                            "teacher_id",
                                            "created_at",
                                            "status",
                                            "document_url",
                                            "teacher_name",
                                            "teacher_eid",
                                            "teacher_designation",
                                            "teacher_mobile",
                                            "teacher_department",
                                          ];
                                          if (excludedKeys.includes(key) || !value) return null;
                                          return (
                                            <div key={key}>
                                              <p className="text-sm font-medium capitalize">
                                                {key.replace(/_/g, " ")}:
                                              </p>
                                              <p className="text-sm">{String(value)}</p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                  Approved
                                </span>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openDeleteDialog(achievement)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No approved achievements</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Teacher Document Statistics Modal */}
      {teacherStatModalOpen && teacherStatModalFilter && selectedTeacher && (
        <Dialog open={teacherStatModalOpen} onOpenChange={setTeacherStatModalOpen}>
          {/* Increased max width for better UI */}
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">
                {teacherStatModalFilter.filterType === "all"
                  ? "All Documents"
                  : `${teacherStatModalFilter.filterType} : ${teacherStatModalFilter.filterValue}`}
              </h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => exportCSV()}>
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setTeacherStatModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-auto">
              {getFilteredTeacherAchievements().length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Teacher Name</th>
                      <th className="px-4 py-2 text-left">EID</th>
                      <th className="px-4 py-2 text-left">Designation</th>
                      <th className="px-4 py-2 text-left">Mobile</th>
                      <th className="px-4 py-2 text-left">Department</th>
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Date Achieved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredTeacherAchievements().map((ach) => (
                      <tr key={ach.id}>
                        <td className="px-4 py-2">{ach.teacher_name}</td>
                        <td className="px-4 py-2">{ach.teacher_eid}</td>
                        <td className="px-4 py-2">{ach.teacher_designation}</td>
                        <td className="px-4 py-2">{ach.teacher_mobile}</td>
                        <td className="px-4 py-2">{ach.teacher_department}</td>
                        <td className="px-4 py-2">{ach.title}</td>
                        <td className="px-4 py-2">{ach.category}</td>
                        <td className="px-4 py-2">{new Date(ach.date_achieved).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500">No records found.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Document Viewer Dialog */}
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
                <iframe src={viewDocumentUrl} title="Document Preview" className="w-full h-full" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>This achievement is being deleted. This action cannot be undone. Are you sure?</p>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (achievementToDelete) {
                  await handleDeleteAchievement(achievementToDelete.id);
                  setDeleteDialogOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points Approval Dialog */}
      {selectedAchievementForPoints && (
        <PointsApprovalDialog
          isOpen={isPointsDialogOpen}
          onClose={() => {
            setIsPointsDialogOpen(false);
            setSelectedAchievementForPoints(null);
          }}
          achievementId={selectedAchievementForPoints.id}
          teacherId={selectedAchievementForPoints.teacherId}
          teacherName={selectedAchievementForPoints.teacherName}
          onApprovalComplete={() => {
            fetchTeachers();
          }}
        />
      )}
    </div>
  );
};

export default AdminTeachers;
