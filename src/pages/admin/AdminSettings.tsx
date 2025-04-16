
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  message: string;
  created_at: string;
  department: string | null;
}

interface ImportantDetail {
  id: string;
  detail: string;
  created_at: string;
  department: string | null;
}

interface AdminContext {
  departments: string[];
  isSuperAdmin: boolean;
}

const AdminSettings = () => {
  const [newMessage, setNewMessage] = useState("");
  const [newDetail, setNewDetail] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [details, setDetails] = useState<ImportantDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentList, setDepartmentList] = useState<{ id: string; name: string }[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDetailDepartment, setSelectedDetailDepartment] = useState<string | null>(null);
  const { departments, isSuperAdmin } = useOutletContext<AdminContext>();

  useEffect(() => {
    fetchDepartments();
    fetchMessages();
    fetchDetails();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase.from("departments").select("*");
      
      if (error) {
        console.error("Error fetching departments:", error);
        return;
      }
      
      setDepartmentList(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("important_messages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("important_details")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching details:", error);
        return;
      }
      
      setDetails(data || []);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const handleAddMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("important_messages").insert({
        message: newMessage,
        department: selectedDepartment
      });

      if (error) {
        toast.error("Failed to add message");
        console.error("Error adding message:", error);
        return;
      }

      toast.success("Message added successfully");
      setNewMessage("");
      setSelectedDepartment(null);
      fetchMessages();
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDetail = async () => {
    if (!newDetail.trim()) {
      toast.error("Detail cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("important_details").insert({
        detail: newDetail,
        department: selectedDetailDepartment
      });

      if (error) {
        toast.error("Failed to add detail");
        console.error("Error adding detail:", error);
        return;
      }

      toast.success("Detail added successfully");
      setNewDetail("");
      setSelectedDetailDepartment(null);
      fetchDetails();
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("important_messages")
        .delete()
        .eq("id", messageId);
      
      if (error) {
        toast.error("Failed to delete message");
        console.error("Error deleting message:", error);
        return;
      }
      
      toast.success("Message deleted successfully");
      fetchMessages();
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error:", error);
    }
  };

  const handleDeleteDetail = async (detailId: string) => {
    try {
      const { error } = await supabase
        .from("important_details")
        .delete()
        .eq("id", detailId);
      
      if (error) {
        toast.error("Failed to delete detail");
        console.error("Error deleting detail:", error);
        return;
      }
      
      toast.success("Detail deleted successfully");
      fetchDetails();
    } catch (error) {
      toast.error("An error occurred");
      console.error("Error:", error);
    }
  };

  const getDepartmentName = (id: string | null): string => {
    if (!id) return "All Departments";
    const dept = departmentList.find(d => d.id === id);
    return dept ? dept.name : "Unknown Department";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>

      <div className="grid gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Important Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Add an important message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex items-center gap-4">
                  <Select 
                    value={selectedDepartment || ""} 
                    onValueChange={(value) => setSelectedDepartment(value === "" ? null : value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departmentList.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddMessage} disabled={loading}>
                    Add Message
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden mt-4">
                <div className="bg-muted px-4 py-2 font-medium">
                  Existing Messages
                </div>
                <div className="p-4 divide-y">
                  {messages.length > 0 ? (
                    messages.map((message) => (
                      <div key={message.id} className="py-3 flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm mb-1">{message.message}</p>
                          <span className="text-xs text-gray-500 block">
                            Visible to: <strong>{getDepartmentName(message.department)}</strong>
                          </span>
                          {message.created_at && (
                            <span className="text-xs text-gray-500 block">
                              Added on: {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                message.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteMessage(message.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))
                  ) : (
                    <p className="py-3 text-gray-500 text-center">No messages added yet</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Important Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Add an important detail..."
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex items-center gap-4">
                  <Select 
                    value={selectedDetailDepartment || ""} 
                    onValueChange={(value) => setSelectedDetailDepartment(value === "" ? null : value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departmentList.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddDetail} disabled={loading}>
                    Add Detail
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden mt-4">
                <div className="bg-muted px-4 py-2 font-medium">
                  Existing Details
                </div>
                <div className="p-4 divide-y">
                  {details.length > 0 ? (
                    details.map((detail) => (
                      <div key={detail.id} className="py-3 flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm mb-1">{detail.detail}</p>
                          <span className="text-xs text-gray-500 block">
                            Visible to: <strong>{getDepartmentName(detail.department)}</strong>
                          </span>
                          {detail.created_at && (
                            <span className="text-xs text-gray-500 block">
                              Added on: {new Date(detail.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                detail.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteDetail(detail.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))
                  ) : (
                    <p className="py-3 text-gray-500 text-center">No details added yet</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
