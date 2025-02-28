
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper to ensure the URL includes a protocol and has no extra whitespace
const ensureValidUrl = (url: string) => {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const AdminDashboard = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [pendingAchievements, setPendingAchievements] = useState<any[]>([]);
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
        .from("achievements")
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
        .from("achievements")
        .select(`
          id,
          achievement_type,
          title,
          issuing_organization,
          link_url,
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
        .from("achievements")
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
    setImportantMessages(data?.map((msg) => ({ id: msg.id, text: msg.message })) || []);
  };

  const fetchImportantDetails = async () => {
    const { data } = await supabase.from("important_details").select("*");
    setImportantDetails(data?.map((detail) => ({ id: detail.id, text: detail.detail })) || []);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
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
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => handleApproval(achievement.id, "Rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-md font-medium">
                        {achievement.achievement_type} - {achievement.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Issuing Organization: {achievement.issuing_organization}
                      </p>
                      {achievement.link_url && (
                        <a
                          href={ensureValidUrl(achievement.link_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Uploaded Link
                        </a>
                      )}
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
    </div>
  );
};

export default AdminDashboard;
