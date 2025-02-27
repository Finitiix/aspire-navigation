import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    pendingAchievements: 0,
    totalFeedback: 0,
  });

  const [importantMessages, setImportantMessages] = useState<string[]>([]);
  const [importantDetails, setImportantDetails] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newDetail, setNewDetail] = useState("");

  useEffect(() => {
    fetchData();
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
    const { data, error } = await supabase.from("important_messages").insert([{ message: newMessage }]);
    if (error) {
      toast.error("Error adding message");
    } else {
      setImportantMessages([...importantMessages, { id: data[0].id, text: newMessage }]);
      setNewMessage("");
    }
  };

  const addDetail = async () => {
    if (!newDetail.trim()) return;
    const { data, error } = await supabase.from("important_details").insert([{ detail: newDetail }]);
    if (error) {
      toast.error("Error adding detail");
    } else {
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
              <Button onClick={addMessage} className="ml-2">Add</Button>
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
              <Button onClick={addDetail} className="ml-2">Add</Button>
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
