import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, ExternalLink, FileText, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import RejectReasonModal from "@/components/RejectReasonModal";

// Helper to ensure the URL includes a protocol and has no extra whitespace
const ensureValidUrl = (url: string) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

type DetailedAchievement = {
  id: string;
  category: string;
  title: string;
  date_achieved: string;
  remarks?: string;
  document_url?: string;
  status: string;
  // Teacher details (stored in the achievement record)
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

const AdminDashboard = () => {
  // Get department info from local storage
  const department = localStorage.getItem("admin_department");
  const isSuper = localStorage.getItem("is_super_admin") === "true";

  // General states
  const [feedback, setFeedback] = useState<any[]>([]);
  const [pendingAchievements, setPendingAchievements] = useState<DetailedAchievement[]>([]);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    pendingAchievements: 0,
    totalFeedback: 0,
  });
  const [docStats, setDocStats] = useState({
    totalDocuments: 0,
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
  });
  // All achievements (for statistics filtering and export)
  const [allAchievements, setAllAchievements] = useState<DetailedAchievement[]>([]);
  const [importantMessages, setImportantMessages] = useState<any[]>([]);
  const [importantDetails, setImportantDetails] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectModalAchievement, setRejectModalAchievement] = useState<DetailedAchievement | null>(null);
  const [rejectModalReason, setRejectModalReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Modal for viewing document proof
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);
  // For multiple approval in Approval Requests section
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);

  // Modal state for showing statistic details; filter holds type and value.
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [statModalFilter, setStatModalFilter] = useState<{ filterType: string; filterValue: any } | null>(null);

  useEffect(() => {
    fetchData();
    fetchPendingAchievements();
    fetchImportantMessages();
    fetchImportantDetails();
    fetchAllDocStats();
  }, []);

  // Fetch general stats and feedback
  const fetchData = async () => {
    try {
      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("name, message, created_at")
        .order("created_at", { ascending: false });

      // When fetching teacher count, filter by department if user is NOT a super admin
      let teacherQuery = supabase
        .from("teacher_details")
        .select("*", { count: "exact" });
      if (!isSuper && department) {
        teacherQuery = teacherQuery.eq("department", department);
      }
      const { count: teacherCount } = await teacherQuery;

      // Fetch pending achievements with a similar filter for teacher_department
      let pendingQuery = supabase
        .from("detailed_achievements")
        .select("*", { count: "exact" })
        .eq("status", "Pending Approval");
      if (!isSuper && department) {
        pendingQuery = pendingQuery.eq("teacher_department", department);
      }
      const { count: pendingCount } = await pendingQuery;

      const { count: feedbackCount } = await supabase
        .from("feedback")
        .select("*", { count: "exact" });

      setFeedback(feedbackData || []);
      setStats({
        totalTeachers: teacherCount || 0,
        pendingAchievements: pendingCount || 0,
        totalFeedback: feedbackCount || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading dashboard data");
    }
  };

  // Fetch pending achievements (for approval)
  const fetchPendingAchievements = async () => {
    try {
      let query = supabase
        .from("detailed_achievements")
        .select("*")
        .eq("status", "Pending Approval")
        .order("created_at", { ascending: false });
      if (!isSuper && department) {
        query = query.eq("teacher_department", department);
      }
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching achievements:", error);
        toast.error("Error fetching pending achievements");
      } else {
        setPendingAchievements(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error fetching pending achievements");
    }
  };

  // Fetch ALL achievements (for statistics and export)
  const fetchAllDocStats = async () => {
    try {
      let query = supabase.from("detailed_achievements").select("*");
      if (!isSuper && department) {
        query = query.eq("teacher_department", department);
      }
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching doc stats:", error);
        toast.error("Error loading document stats");
        return;
      }
      if (data) {
        setAllAchievements(data);
      }
      const aggregated = {
        totalDocuments: 0,
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

      data.forEach((achievement: DetailedAchievement) => {
        aggregated.totalDocuments++;
        if (achievement.category && aggregated.categories[achievement.category] !== undefined) {
          aggregated.categories[achievement.category]++;
        }
        if (achievement.date_achieved) {
          const year = new Date(achievement.date_achieved).getFullYear();
          if ([2022, 2023, 2024, 2025].includes(year)) {
            aggregated.yearly[year]++;
          }
        }
        if (achievement.q_ranking && aggregated.quality[achievement.q_ranking] !== undefined) {
          aggregated.quality[achievement.q_ranking]++;
        }
        if (achievement.indexed_in && Array.isArray(achievement.indexed_in)) {
          achievement.indexed_in.forEach((index: string) => {
            if (aggregated.indexed[index] !== undefined) {
              aggregated.indexed[index]++;
            }
          });
        }
      });

      setDocStats(aggregated);
    } catch (error) {
      console.error("Error processing doc stats:", error);
      toast.error("Error processing document statistics");
    }
  };

  // Bulk approval/rejection
  const handleBulkApproval = async (status: "Approved" | "Rejected") => {
    try {
      if (selectedAchievements.length === 0) {
        toast.error("No achievements selected!");
        return;
      }
      const { error } = await supabase
        .from("detailed_achievements")
        .update({ status })
        .in("id", selectedAchievements);
      if (error) {
        toast.error("Error updating achievements");
      } else {
        toast.success(`Achievements ${status}`);
        fetchPendingAchievements();
        fetchData();
        setSelectedAchievements([]);
      }
    } catch (error) {
      toast.error("Error processing bulk approval");
    }
  };

  // Toggle individual achievement selection
  const toggleSelection = (id: string) => {
    if (selectedAchievements.includes(id)) {
      setSelectedAchievements(selectedAchievements.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedAchievements([...selectedAchievements, id]);
    }
  };

  // "Select All" checkbox handler
  const handleSelectAll = () => {
    if (selectedAchievements.length === pendingAchievements.length) {
      setSelectedAchievements([]);
    } else {
      setSelectedAchievements(pendingAchievements.map((ach) => ach.id));
    }
  };

  // Individual approval/rejection handler
  const handleApproval = async (id: string, status: "Approved" | "Rejected", achievement?: DetailedAchievement) => {
    if (status === "Approved") {
      const ach = achievement ?? pendingAchievements.find(a => a.id === id);
      if (ach) {
        await sendApprovalEmail(ach);
      }
      try {
        const { error } = await supabase
          .from("detailed_achievements")
          .update({ status: "Approved" })
          .eq("id", id);
        if (error) {
          toast.error("Error updating achievement status");
        } else {
          toast.success("Achievement Approved");
          fetchPendingAchievements();
          fetchData();
        }
      } catch (error) {
        toast.error("Error processing request");
      }
    } else {
      const ach = achievement ?? pendingAchievements.find(a => a.id === id);
      if (!ach) {
        toast.error("Achievement not found");
        return;
      }
      setRejectModalAchievement(ach);
      setRejectModalReason("");
      setRejectModalOpen(true);
    }
  };

  // Fetch important messages and details
  const fetchImportantMessages = async () => {
    const { data } = await supabase.from("important_messages").select("*");
    setImportantMessages(data ? data.map((msg) => ({ id: msg.id, text: msg.message })) : []);
  };

  const fetchImportantDetails = async () => {
    const { data } = await supabase.from("important_details").select("*");
    setImportantDetails(data ? data.map((detail) => ({ id: detail.id, text: detail.detail })) : []);
  };

  const addMessage = async () => {
    if (!newMessage.trim()) return;
    const { data, error } = await supabase.from("important_messages").insert([{ message: newMessage }]).select();
    if (error) {
      toast.error("Error adding message");
    } else if (data && data.length > 0) {
      setImportantMessages([...importantMessages, { id: data[0].id, text: newMessage }]);
      setNewMessage("");
    }
  };

  const addDetail = async () => {
    if (!newDetail.trim()) return;
    const { data, error } = await supabase.from("important_details").insert([{ detail: newDetail }]).select();
    if (error) {
      toast.error("Error adding detail");
    } else if (data && data.length > 0) {
      setImportantDetails([...importantDetails, { id: data[0].id, text: newDetail }]);
      setNewDetail("");
    }
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("important_messages").delete().eq("id", id);
    setImportantMessages(importantMessages.filter((msg) => msg.id !== id));
  };

  const deleteDetail = async (id: string) => {
    await supabase.from("important_details").delete().eq("id", id);
    setImportantDetails(importantDetails.filter((detail) => detail.id !== id));
  };

  // Handler for viewing document proof modal
  const handleViewDocument = (url: string) => {
    setViewDocumentUrl(url);
  };

  // Fetch teacher email from teacher_details
  const fetchTeacherEmail = async (eid: string) => {
    try {
      const { data, error } = await supabase
        .from("teacher_details")
        .select("email_id, full_name")
        .eq("eid", eid)
        .maybeSingle();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  };

  // EMAIL: Approve
  const sendApprovalEmail = async (achievement: DetailedAchievement) => {
    // Fetch email and teacher name
    const emailData = await fetchTeacherEmail(achievement.teacher_eid);
    if (!emailData) {
      toast.error("Teacher email not found");
      return;
    }
    try {
      await fetch("/functions/v1/send-teacher-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailData.email_id,
          teacherName: emailData.full_name,
          type: "approved",
          document: achievement,
        }),
      });
      toast.success("Approval email sent 🎉");
    } catch {
      toast.error("Failed to send approval email");
    }
  };

  // EMAIL: Reject (called from inside modal)
  const sendRejectEmail = async () => {
    if (!rejectModalAchievement) return;
    setRejectLoading(true);
    const emailData = await fetchTeacherEmail(rejectModalAchievement.teacher_eid);
    if (!emailData) {
      setRejectLoading(false);
      toast.error("Teacher email not found");
      return;
    }
    try {
      await fetch("/functions/v1/send-teacher-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailData.email_id,
          teacherName: emailData.full_name,
          type: "rejected",
          reason: rejectModalReason,
          document: rejectModalAchievement,
        }),
      });
      toast.success("Rejection email sent!");
      setRejectModalOpen(false);
      setRejectModalAchievement(null);
      setRejectModalReason("");
    } catch {
      toast.error("Failed to send rejection email");
    } finally {
      setRejectLoading(false);
    }
  };

  // ----- STATISTICS MODAL FUNCTIONALITY -----
  // Open modal given a filter type and value
  const openStatModal = (filterType: string, filterValue: any) => {
    setStatModalFilter({ filterType, filterValue });
    setStatModalOpen(true);
  };

  // Filter achievements based on modal filter
  const getFilteredAchievements = (): DetailedAchievement[] => {
    if (!statModalFilter) return [];
    const { filterType, filterValue } = statModalFilter;
    if (filterType === "all") {
      return allAchievements;
    } else if (filterType === "indexed") {
      return allAchievements.filter((achievement) => achievement.indexed_in && achievement.indexed_in.includes(filterValue));
    } else if (filterType === "categories") {
      return allAchievements.filter((achievement) => achievement.category === filterValue);
    } else if (filterType === "yearly") {
      return allAchievements.filter(
        (achievement) => new Date(achievement.date_achieved).getFullYear() === filterValue
      );
    } else if (filterType === "quality") {
      return allAchievements.filter((achievement) => achievement.q_ranking === filterValue);
    }
    return [];
  };

  // Export CSV for detailed achievement data
  const exportCSV = (data: DetailedAchievement[], filename: string) => {
    if (!data || data.length === 0) return;
    const replacer = (_key: string, value: any) => (value === null ? "" : value);
    const header = Object.keys(data[0]);
    const csv = [
      header.join(","),
      ...data.map((row) =>
        header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Export summary data as CSV (structured summary)
  const exportSummary = () => {
    const summaryRows = [
      ["Category", "Metric", "Value"],
      ["General", "Total Documents", docStats.totalDocuments],
      ["Indexed", "SCI", docStats.indexed.SCI],
      ["Indexed", "Scopus", docStats.indexed.Scopus],
      ["Indexed", "UGC Approved", docStats.indexed["UGC Approved"]],
      ["Indexed", "WOS", docStats.indexed.WOS],
      ["Indexed", "IEEE Xplore", docStats.indexed["IEEE Xplore"]],
      ["Indexed", "Springer", docStats.indexed.Springer],
      ["Indexed", "Elsevier", docStats.indexed.Elsevier],
      [],
      ["Yearly", "2022", docStats.yearly["2022"]],
      ["Yearly", "2023", docStats.yearly["2023"]],
      ["Yearly", "2024", docStats.yearly["2024"]],
      ["Yearly", "2025", docStats.yearly["2025"]],
      [],
      ["Quality", "Q1", docStats.quality.Q1],
      ["Quality", "Q2", docStats.quality.Q2],
      ["Quality", "Q3", docStats.quality.Q3],
      ["Quality", "Q4", docStats.quality.Q4],
      [],
      ["Categories", "Journal Articles", docStats.categories["Journal Articles"]],
      ["Categories", "Conference Papers", docStats.categories["Conference Papers"]],
      ["Categories", "Books & Book Chapters", docStats.categories["Books & Book Chapters"]],
      ["Categories", "Patents", docStats.categories["Patents"]],
      ["Categories", "Research Collaborations", docStats.categories["Research Collaborations"]],
      ["Categories", "Awards & Recognitions", docStats.categories["Awards & Recognitions"]],
      ["Categories", "Consultancy & Funded Projects", docStats.categories["Consultancy & Funded Projects"]],
      ["Categories", "Startups & Centers of Excellence", docStats.categories["Startups & Centers of Excellence"]],
      ["Categories", "Others", docStats.categories["Others"]],
    ];

    // Convert rows to CSV string. Use empty rows as separator.
    const csv = summaryRows
      .map((row) => row.join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "documents_summary.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Teachers</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalTeachers}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-primary">{stats.pendingAchievements}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Feedback</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalFeedback}</p>
        </Card>
      </div>

      {/* Approval Requests for Achievements Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Approval Requests for Achievements</h2>
        {/* Bulk Action Buttons & Select All */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkApproval("Approved")}
              disabled={selectedAchievements.length === 0}
            >
              Approve Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkApproval("Rejected")}
              disabled={selectedAchievements.length === 0}
            >
              Reject Selected
            </Button>
            <div className="flex items-center ml-4">
              <input
                type="checkbox"
                checked={
                  pendingAchievements.length > 0 &&
                  selectedAchievements.length === pendingAchievements.length
                }
                onChange={handleSelectAll}
                className="mr-1"
              />
              <span className="text-sm">Select All</span>
            </div>
          </div>
          {selectedAchievements.length > 0 && (
            <p className="text-sm text-gray-600">{selectedAchievements.length} selected</p>
          )}
        </div>
        <div className="space-y-4">
          {pendingAchievements.length > 0 ? (
            pendingAchievements.map((achievement) => (
              <div key={achievement.id} className="relative bg-white shadow rounded p-4">
                {/* Teacher Info and Selection */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAchievements.includes(achievement.id)}
                      onChange={() => toggleSelection(achievement.id)}
                      className="mr-2"
                    />
                    <div>
                      <p className="font-bold text-lg">{achievement.teacher_name || "Unknown Teacher"}</p>
                      <p className="text-sm text-gray-600">
                        EID: {achievement.teacher_eid} | {achievement.teacher_designation}
                      </p>
                      <p className="text-sm text-gray-600">
                        Mobile: {achievement.teacher_mobile} | Dept: {achievement.teacher_department}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => handleApproval(achievement.id, "Approved", achievement)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleApproval(achievement.id, "Rejected", achievement)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
                {/* Document Details */}
                <div className="mt-4">
                  <p className="text-md font-medium">
                    {achievement.category} - {achievement.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date Achieved: {new Date(achievement.date_achieved).toLocaleDateString()}
                  </p>
                  {achievement.remarks && (
                    <p className="text-sm text-gray-600">Remarks: {achievement.remarks}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    {achievement.document_url && (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-blue-600"
                          onClick={() => handleViewDocument(achievement.document_url!)}
                        >
                          <FileText className="h-4 w-4" />
                          View Document Proof
                        </Button>
                      </div>
                    )}
                    {achievement.journal_link && (
                      <a
                        href={ensureValidUrl(achievement.journal_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Journal Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {achievement.paper_link && (
                      <a
                        href={ensureValidUrl(achievement.paper_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Conference Paper Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {achievement.book_drive_link && (
                      <a
                        href={ensureValidUrl(achievement.book_drive_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Book Drive Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {achievement.patent_link && (
                      <a
                        href={ensureValidUrl(achievement.patent_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Patent Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {achievement.certificate_link && (
                      <a
                        href={ensureValidUrl(achievement.certificate_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Certificate Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {achievement.project_details_link && (
                      <a
                        href={ensureValidUrl(achievement.project_details_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Project Details Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {achievement.website_link && (
                      <a
                        href={ensureValidUrl(achievement.website_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Website Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                    {achievement.proof_link && (
                      <a
                        href={ensureValidUrl(achievement.proof_link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        Proof Link <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                  {/* Category-Specific Details */}
                  <div className="mt-4 border-t pt-2">
                    <h4 className="font-semibold mb-2">Category Specific Details:</h4>
                    {achievement.category === "Journal Articles" && (
                      <div className="text-sm space-y-1">
                        {achievement.journal_name && <p>Journal Name: {achievement.journal_name}</p>}
                        {achievement.issn && <p>ISSN: {achievement.issn}</p>}
                        {achievement.doi && <p>DOI: {achievement.doi}</p>}
                        {achievement.publisher && <p>Publisher: {achievement.publisher}</p>}
                        {achievement.indexed_in && achievement.indexed_in.length > 0 && (
                          <p>Indexed In: {achievement.indexed_in.join(", ")}</p>
                        )}
                        {achievement.q_ranking && <p>Q Ranking: {achievement.q_ranking}</p>}
                      </div>
                    )}
                    {achievement.category === "Conference Papers" && (
                      <div className="text-sm space-y-1">
                        {achievement.conference_name && <p>Conference Name: {achievement.conference_name}</p>}
                        {achievement.conference_date && (
                          <p>Conference Date: {new Date(achievement.conference_date).toLocaleDateString()}</p>
                        )}
                        {achievement.proceedings_publisher && <p>Proceedings Publisher: {achievement.proceedings_publisher}</p>}
                        {achievement.isbn && <p>ISBN: {achievement.isbn}</p>}
                      </div>
                    )}
                    {achievement.category === "Books & Book Chapters" && (
                      <div className="text-sm space-y-1">
                        {achievement.book_title && <p>Book Title: {achievement.book_title}</p>}
                        {achievement.chapter_title && <p>Chapter Title: {achievement.chapter_title}</p>}
                        {achievement.year_of_publication && (
                          <p>Year of Publication: {new Date(achievement.year_of_publication).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                    {achievement.category === "Patents" && (
                      <div className="text-sm space-y-1">
                        {achievement.patent_number && <p>Patent Number: {achievement.patent_number}</p>}
                        {achievement.patent_office && <p>Patent Office: {achievement.patent_office}</p>}
                        {achievement.filing_date && (
                          <p>Filing Date: {new Date(achievement.filing_date).toLocaleDateString()}</p>
                        )}
                        {achievement.grant_date && (
                          <p>Grant Date: {new Date(achievement.grant_date).toLocaleDateString()}</p>
                        )}
                        {achievement.patent_status && <p>Patent Status: {achievement.patent_status}</p>}
                      </div>
                    )}
                    {achievement.category === "Research Collaborations" && (
                      <div className="text-sm space-y-1">
                        {achievement.partner_institutions && <p>Partner Institutions: {achievement.partner_institutions}</p>}
                        {achievement.research_area && <p>Research Area: {achievement.research_area}</p>}
                        {achievement.collaboration_details && <p>Collaboration Details: {achievement.collaboration_details}</p>}
                      </div>
                    )}
                    {achievement.category === "Awards & Recognitions" && (
                      <div className="text-sm space-y-1">
                        {achievement.award_name && <p>Award Name: {achievement.award_name}</p>}
                        {achievement.awarding_body && <p>Awarding Body: {achievement.awarding_body}</p>}
                        {achievement.award_type && <p>Award Type: {achievement.award_type}</p>}
                      </div>
                    )}
                    {achievement.category === "Consultancy & Funded Projects" && (
                      <div className="text-sm space-y-1">
                        {achievement.client_organization && <p>Client Organization: {achievement.client_organization}</p>}
                        {achievement.project_title && <p>Project Title: {achievement.project_title}</p>}
                        {achievement.funding_agency && <p>Funding Agency: {achievement.funding_agency}</p>}
                        {achievement.funding_amount !== undefined && (
                          <p>Funding Amount: {achievement.funding_amount}</p>
                        )}
                        {achievement.project_duration_start && (
                          <p>Project Start: {new Date(achievement.project_duration_start).toLocaleDateString()}</p>
                        )}
                        {achievement.project_duration_end && (
                          <p>Project End: {new Date(achievement.project_duration_end).toLocaleDateString()}</p>
                        )}
                        {achievement.project_status && <p>Project Status: {achievement.project_status}</p>}
                      </div>
                    )}
                    {achievement.category === "Startups & Centers of Excellence" && (
                      <div className="text-sm space-y-1">
                        {achievement.startup_center_name && <p>Startup/Center Name: {achievement.startup_center_name}</p>}
                        {achievement.domain && <p>Domain: {achievement.domain}</p>}
                        {achievement.funding_details && <p>Funding Details: {achievement.funding_details}</p>}
                      </div>
                    )}
                    {achievement.category === "Others" && (
                      <div className="text-sm space-y-1">
                        {achievement.description && <p>Description: {achievement.description}</p>}
                        {achievement.organization && <p>Organization: {achievement.organization}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No pending achievements.</p>
          )}
        </div>
      </Card>

      {/* Document & Achievement Statistics Section */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-2xl font-bold text-center sm:text-left">
            Document & Achievement Statistics
          </h2>
          <Button variant="outline" size="sm" onClick={exportSummary}>
            <Download className="w-4 h-4 mr-1" />
            Export Summary
          </Button>
        </div>
        {/* Statistics rendered as interactive cards/buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-4 rounded shadow flex flex-col items-center text-white">
            <h3 className="text-lg font-semibold">Total Documents Uploaded</h3>
            <Button
              variant="ghost"
              className="text-3xl font-bold text-white underline"
              onClick={() => openStatModal("all", "all")}
            >
              {docStats.totalDocuments}
            </Button>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-400 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Indexed Documents</h3>
            <ul className="mt-2 space-y-1">
              {Object.entries(docStats.indexed).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <Button
                    variant="ghost"
                    className="text-sm text-gray-800 underline"
                    onClick={() => openStatModal("indexed", key)}
                  >
                    {key}
                  </Button>
                  <span className="font-semibold text-gray-800">{value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-400 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-white mb-2">Yearly Uploads</h3>
            <ul className="mt-2 space-y-1">
              {Object.entries(docStats.yearly).map(([year, count]) => (
                <li key={year} className="flex justify-between">
                  <Button
                    variant="ghost"
                    className="text-sm text-white underline"
                    onClick={() => openStatModal("yearly", Number(year))}
                  >
                    {year}
                  </Button>
                  <span className="font-semibold text-white">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Category Breakdown (Pie Chart)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={Object.entries(docStats.categories).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {Object.entries(docStats.categories).map((entry, index) => {
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
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700">Category Details</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(docStats.categories).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center p-2 border rounded bg-white">
                    <Button
                      variant="ghost"
                      className="text-sm text-gray-700 underline"
                      onClick={() => openStatModal("categories", cat)}
                    >
                      {cat}
                    </Button>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Quality Ranking (Q1 - Q4)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { quality: "Q1", count: docStats.quality["Q1"] },
                { quality: "Q2", count: docStats.quality["Q2"] },
                { quality: "Q3", count: docStats.quality["Q3"] },
                { quality: "Q4", count: docStats.quality["Q4"] },
              ]}>
                <XAxis dataKey="quality" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700">Quality Details</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                  <div key={q} className="flex justify-between items-center p-2 border rounded bg-white">
                    <Button
                      variant="ghost"
                      className="text-sm text-gray-700 underline"
                      onClick={() => openStatModal("quality", q)}
                    >
                      {q}
                    </Button>
                    <span className="font-bold">{docStats.quality[q as keyof typeof docStats.quality]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Important Messages & Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Important Messages</h2>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {importantMessages.map((msg) => (
              <div key={msg.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <p>{msg.text}</p>
                <Button size="sm" variant="ghost" onClick={() => deleteMessage(msg.id)}>
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex">
            <input
              type="text"
              className="border p-2 w-full rounded"
              placeholder="Add a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button onClick={addMessage} className="ml-2">
              Add
            </Button>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Important Details</h2>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {importantDetails.map((detail) => (
              <div key={detail.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <p>{detail.text}</p>
                <Button size="sm" variant="ghost" onClick={() => deleteDetail(detail.id)}>
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex">
            <input
              type="text"
              className="border p-2 w-full rounded"
              placeholder="Add a detail..."
              value={newDetail}
              onChange={(e) => setNewDetail(e.target.value)}
            />
            <Button onClick={addDetail} className="ml-2">
              Add
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Feedback Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Feedback</h2>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {feedback.length > 0 ? (
            feedback.map((item, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-700">{item.message}</p>
                <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No feedback available.</p>
          )}
        </div>
      </Card>

      {/* Document Viewer Modal */}
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

      {/* STATISTICS DETAILS MODAL */}
      {statModalOpen && statModalFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-lg max-w-4xl max-h-[90vh] w-full overflow-auto">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-xl font-bold">
                {statModalFilter.filterType === "all"
                  ? "All Documents"
                  : `${statModalFilter.filterType} : ${statModalFilter.filterValue}`}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    exportCSV(
                      getFilteredAchievements(),
                      `export_${statModalFilter.filterType}_${statModalFilter.filterValue}.csv`
                    )
                  }
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setStatModalOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-auto">
              {getFilteredAchievements().length > 0 ? (
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
                    {getFilteredAchievements().map((ach) => (
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
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <RejectReasonModal
        open={rejectModalOpen}
        teacherEmail={rejectModalAchievement?.teacher_eid ? (rejectModalAchievement?.teacher_eid) : ""}
        title={rejectModalAchievement?.title || ""}
        loading={rejectLoading}
        reason={rejectModalReason}
        onReasonChange={setRejectModalReason}
        onClose={() => { setRejectModalOpen(false); setRejectModalAchievement(null); setRejectModalReason(""); }}
        onSend={sendRejectEmail}
      />
    </div>
  );
};

export default AdminDashboard;
