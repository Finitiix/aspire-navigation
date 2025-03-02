
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Download, Check, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

// Define types
type Teacher = {
  id: string;
  full_name: string;
  email_id: string;
  department: string;
  designation: string;
  mobile_number: string;
  eid: string;
  achievements?: DetailedAchievement[];
  [key: string]: any;
};

type DetailedAchievement = {
  id: string;
  category: string;
  title: string;
  date_achieved: string;
  status: string;
  [key: string]: any;
};

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = teachers.filter(
        (teacher) =>
          teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.email_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.eid.toLowerCase().includes(searchQuery.toLowerCase()) ||
          teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      const { data: teachersData, error } = await supabase
        .from("teacher_details")
        .select("*")
        .order("full_name");

      if (error) throw error;

      if (teachersData) {
        // Get achievements for each teacher
        const teachersWithAchievements = await Promise.all(
          teachersData.map(async (teacher) => {
            const { data: achievements } = await supabase
              .from("detailed_achievements")
              .select("*")
              .eq("teacher_id", teacher.id);
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

  const handleExportToCSV = async () => {
    setIsExporting(true);
    try {
      // Get all teachers with their achievements
      const { data: teachersData, error } = await supabase
        .from("teacher_details")
        .select("*")
        .order("full_name");

      if (error) throw error;

      const teachersWithAchievements = await Promise.all(
        teachersData.map(async (teacher) => {
          const { data: achievements } = await supabase
            .from("detailed_achievements")
            .select("*")
            .eq("teacher_id", teacher.id);
          return { ...teacher, achievements: achievements || [] };
        })
      );

      // Create CSV content
      let csvContent = "Name,EID,Email,Department,Designation,Mobile,Achievement Count,Approved Achievements\n";

      teachersWithAchievements.forEach((teacher) => {
        const achievementCount = teacher.achievements?.length || 0;
        const approvedCount = teacher.achievements?.filter((a: DetailedAchievement) => a.status === "Approved").length || 0;
        
        csvContent += `"${teacher.full_name}","${teacher.eid}","${teacher.email_id}","${teacher.department}","${teacher.designation}","${teacher.mobile_number}","${achievementCount}","${approvedCount}"\n`;
      });

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `teachers_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleUpdateAchievementStatus = async (achievementId: string, newStatus: "Approved" | "Rejected") => {
    try {
      const { error } = await supabase
        .from("detailed_achievements")
        .update({ status: newStatus })
        .eq("id", achievementId);

      if (error) throw error;

      // Update the local state
      if (selectedTeacher) {
        const updatedAchievements = selectedTeacher.achievements?.map((a) =>
          a.id === achievementId ? { ...a, status: newStatus } : a
        );
        
        setSelectedTeacher({
          ...selectedTeacher,
          achievements: updatedAchievements,
        });

        // Also update in the teachers array
        const updatedTeachers = teachers.map((t) =>
          t.id === selectedTeacher.id
            ? { ...t, achievements: updatedAchievements }
            : t
        );
        
        setTeachers(updatedTeachers);
        setFilteredTeachers(
          filteredTeachers.map((t) =>
            t.id === selectedTeacher.id
              ? { ...t, achievements: updatedAchievements }
              : t
          )
        );
      }

      toast.success(`Achievement marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating achievement status:", error);
      toast.error("Failed to update achievement status");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
        <Button
          onClick={handleExportToCSV}
          disabled={isExporting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isExporting ? "Exporting..." : "Export to CSV"}
          <Download className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, EID, or department..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teachers List ({filteredTeachers.length})</CardTitle>
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
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="border-t">
                      <td className="p-3">{teacher.full_name}</td>
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
                          <Eye className="h-4 w-4 mr-1" /> View
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
            <DialogTitle>Teacher Details</DialogTitle>
          </DialogHeader>

          {selectedTeacher && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p>{selectedTeacher.full_name}</p>
                </div>
                <div>
                  <h3 className="font-medium">EID</h3>
                  <p>{selectedTeacher.eid}</p>
                </div>
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
                        <div key={achievement.id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{achievement.title}</div>
                              <div className="text-sm text-gray-600">
                                {achievement.category} | {new Date(achievement.date_achieved).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(achievement.status)}`}>
                                {achievement.status}
                              </span>
                              {achievement.status === "Pending Approval" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleUpdateAchievementStatus(achievement.id, "Approved")}
                                  >
                                    <Check className="h-4 w-4" />
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
                            </div>
                          </div>
                        </div>
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
                          <div key={achievement.id} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-sm text-gray-600">
                                  {achievement.category} | {new Date(achievement.date_achieved).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                  onClick={() => handleUpdateAchievementStatus(achievement.id, "Approved")}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => handleUpdateAchievementStatus(achievement.id, "Rejected")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
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
                          <div key={achievement.id} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-sm text-gray-600">
                                  {achievement.category} | {new Date(achievement.date_achieved).toLocaleDateString()}
                                </div>
                              </div>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Approved
                              </span>
                            </div>
                          </div>
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
    </div>
  );
};

export default AdminTeachers;
