
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  link_url?: string;
  teacher_details?: {
    full_name: string;
    eid: string;
    designation: string;
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

  const [importantMessages, setImportantMessages] = useState<any[]>([]);
  const [importantDetails, setImportantDetails] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newDetail, setNewDetail] = useState("");

  useEffect(() => {
    fetchData();
    fetchPendingAchievements();
    fetchImportantMessages();
    fetchImportantDetails();
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

  // Fetch achievements with joined teacher details
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
          google_scholar_link,
          scopus_id_link,
          teacher_details (
            full_name,
            eid,
            designation
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

  const ensureValidUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
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
    </div>
  );
};

export default AdminDashboard;
