import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, ExternalLink, FileText, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

// Helper to ensure the URL includes a protocol and has no extra whitespace
const ensureValidUrl = (url: string) => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

type DetailedAchievement = {
  id: string;
  title: string;
  category: string;
  date_achieved: string;
  status: string;
  journal_link?: string;
  book_drive_link?: string;
  patent_link?: string;
  website_link?: string;
  document_url?: string; // Expected field for the uploaded proof document URL
  teacher_details?: {
    full_name: string;
    eid: string;
    designation: string;
    email_id?: string;
  };
  [key: string]: any;
};

const AdminDashboard = () => {
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
  const [importantMessages, setImportantMessages] = useState<any[]>([]);
  const [importantDetails, setImportantDetails] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newDetail, setNewDetail] = useState("");
  
  // State for viewing the document modal
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchPendingAchievements();
    fetchImportantMessages();
    fetchImportantDetails();
    fetchDocStats();
  }, []);

  const fetchData = async () => {
    try {
      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("name, message, created_at")
        .order("created_at", { ascending: false });

      const { count: teacherCount } = await supabase
        .from("teacher_details")
        .select("*", { count: "exact" });

      const { count: pendingCount } = await supabase
        .from("detailed_achievements")
        .select("*", { count: "exact" })
        .eq("status", "Pending Approval");

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

  const fetchPendingAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("detailed_achievements")
        .select(`
          id,
          category,
          title,
          date_achieved,
          status,
          journal_link,
          book_drive_link,
          patent_link,
          website_link,
          document_url,
          q_ranking,
          indexed_in,
          teacher_details (
            full_name,
            eid,
            designation,
            email_id
          )
        `)
        .eq("status", "Pending Approval")
        .order("created_at", { ascending: false });
      
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

  // New function to fetch and aggregate document and achievement statistics
  const fetchDocStats = async () => {
    try {
      const { data, error } = await supabase.from("detailed_achievements").select("*");
      if (error) {
        console.error("Error fetching doc stats:", error);
        toast.error("Error loading document stats");
        return;
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
      data.forEach((achievement: any) => {
        aggregated.totalDocuments++;
        // Category count
        if (achievement.category && aggregated.categories[achievement.category] !== undefined) {
          aggregated.categories[achievement.category]++;
        }
        // Yearly uploads count based on date_achieved
        if (achievement.date_achieved) {
          const year = new Date(achievement.date_achieved).getFullYear();
          if ([2022, 2023, 2024, 2025].includes(year)) {
            aggregated.yearly[year]++;
          }
        }
        // Quality Ranking count (if available)
        if (achievement.q_ranking && aggregated.quality[achievement.q_ranking] !== undefined) {
          aggregated.quality[achievement.q_ranking]++;
        }
        // Indexed documents: check indexed_in array (for Journal Articles)
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

  const handleApproval = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const { error } = await supabase
        .from("detailed_achievements")
        .update({ status })
        .eq("id", id);
      if (error) {
        toast.error("Error updating achievement status");
      } else {
        toast.success(`Achievement ${status}`);
        // Refresh the achievements list and stats
        fetchPendingAchievements();
        fetchData();
      }
    } catch (error) {
      toast.error("Error processing request");
    }
  };

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

  // Handler for viewing the document proof modal
  const handleViewDocument = (url: string) => {
    setViewDocumentUrl(url);
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

      {/* Document & Achievement Statistics Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Document & Achievement Statistics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Documents Uploaded</h3>
            <p className="text-3xl font-bold text-primary mt-2">{docStats.totalDocuments}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700">Indexed Documents</h3>
            <ul className="mt-2 space-y-1">
              {Object.entries(docStats.indexed).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span>{key}</span>
                  <span className="font-semibold">{value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700">Yearly Uploads</h3>
            <ul className="mt-2 space-y-1">
              {Object.entries(docStats.yearly).map(([year, count]) => (
                <li key={year} className="flex justify-between">
                  <span>{year}</span>
                  <span className="font-semibold">{count}</span>
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
                    const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#33AA77", "#7755AA", "#AA5577", "#55AA77"];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {/* Category List */}
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700">Category Details</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(docStats.categories).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center p-2 border rounded bg-white">
                    <span>{cat}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Yearly Uploads (Bar Chart)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { year: "2022", count: docStats.yearly[2022] },
                { year: "2023", count: docStats.yearly[2023] },
                { year: "2024", count: docStats.yearly[2024] },
                { year: "2025", count: docStats.yearly[2025] },
              ]}>
                <XAxis dataKey="year" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-6 bg-gray-50 p-4 rounded shadow">
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
        </div>
      </Card>

      {/* Approval Requests for Achievements Section - Improved with details and clickable links */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Approval Requests for Achievements</h2>
        <div className="space-y-4">
          {pendingAchievements.length > 0 ? (
            pendingAchievements.map((achievement) => {
              const teacher = achievement.teacher_details;
              return (
                <div key={achievement.id} className="relative bg-white shadow rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg">
                        {teacher?.full_name || "Unknown Teacher"}
                      </p>
                      <p className="text-sm text-gray-600">
                        EID: {teacher?.eid} | {teacher?.designation}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApproval(achievement.id, "Approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApproval(achievement.id, "Rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-md font-medium">
                      {achievement.category} - {achievement.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Date: {new Date(achievement.date_achieved).toLocaleDateString()}
                    </p>
                    
                    {/* Detailed achievement information based on category */}
                    <div className="mt-2 text-sm">
                      {achievement.category === 'Journal Articles' && (
                        <div className="mt-2 space-y-1">
                          {achievement.sci_papers && <p>SCI Papers: {achievement.sci_papers}</p>}
                          {achievement.scopus_papers && <p>Scopus Papers: {achievement.scopus_papers}</p>}
                          {achievement.ugc_papers && <p>UGC Papers: {achievement.ugc_papers}</p>}
                          {achievement.research_area && <p>Research Areas: {achievement.research_area}</p>}
                          {achievement.q_ranking && <p>Q Ranking: {achievement.q_ranking}</p>}
                        </div>
                      )}
                      
                      {achievement.category === 'Books & Book Chapters' && (
                        <div className="mt-2 space-y-1">
                          {achievement.book_title && <p>Book Title: {achievement.book_title}</p>}
                          {achievement.publisher && <p>Publisher: {achievement.publisher}</p>}
                          {achievement.chapter_title && <p>Chapter Title: {achievement.chapter_title}</p>}
                        </div>
                      )}
                      
                      {achievement.category === 'Patents' && (
                        <div className="mt-2 space-y-1">
                          {achievement.patent_status && <p>Patent Status: {achievement.patent_status}</p>}
                          {achievement.patent_number && <p>Patent Number: {achievement.patent_number}</p>}
                          {achievement.patent_office && <p>Patent Office: {achievement.patent_office}</p>}
                        </div>
                      )}
                    </div>
                    
                    {/* Display clickable links */}
                    <div className="mt-3 space-y-1">
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
                      
                      {achievement.scopus_id_link && (
                        <a
                          href={ensureValidUrl(achievement.scopus_id_link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          Scopus ID <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      )}
                      
                      {achievement.google_scholar_link && (
                        <a
                          href={ensureValidUrl(achievement.google_scholar_link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          Google Scholar <ExternalLink className="w-3 h-3 ml-1" />
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
                      
                      {/* Document proof link button */}
                      {achievement.document_url && (
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 text-blue-600"
                            onClick={() => handleViewDocument(achievement.document_url!)}
                          >
                            <FileText className="h-4 w-4" />
                            View Uploaded Proof
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500">No pending achievements.</p>
          )}
        </div>
      </Card>

      {/* Important Messages & Details Side by Side */}
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

export default AdminDashboard;
