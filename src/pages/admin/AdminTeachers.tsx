import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { format as dateFormat } from "date-fns";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { jsPDF } from "jspdf";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Achievement = {
  id: string;
  achievement_type: string;
  title: string;
  date_achieved: string;
  status: string;
  sci_papers?: string;
  scopus_papers?: string;
  ugc_papers?: string;
  patents_count?: string;
  research_area?: string;
  links?: string;
  issuing_organization?: string;
  google_scholar_link?: string;
  scopus_id_link?: string;
  book_drive_link?: string;
  book_details?: string;
  book_chapters?: string;
  patent_link?: string;
  patents_remarks?: string;
  funded_projects?: string;
  research_collaboration?: string;
  awards_recognitions?: string;
  consultancy_services?: string;
  startup_details?: string;
  general_remarks?: string;
  q_papers?: string;
  research_remarks?: string;
  [key: string]: any; // For dynamic fields
};

type Teacher = {
  id: string;
  full_name: string;
  department: string;
  eid: string;
  designation: string;
  profile_pic_url: string | null;
  email_id?: string;
  mobile_number?: string;
  highest_qualification?: string;
  date_of_joining?: string;
  address?: string;
  achievements: Achievement[];
  [key: string]: any; // For additional fields
};

interface TeacherState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  departmentFilter: string;
}

const AdminTeachers = () => {
  const [state, setState] = useState<TeacherState>({
    teachers: [],
    loading: false,
    error: null,
    searchQuery: "",
    departmentFilter: "all",
  });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Fetch teacher details along with achievements
  const fetchTeachers = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data: teachers, error: teacherError } = await supabase
        .from("teacher_details")
        .select(`
          id,
          full_name,
          eid,
          department,
          designation,
          email_id,
          mobile_number,
          highest_qualification,
          date_of_joining,
          address,
          profile_pic_url
        `)
        .order("full_name");

      if (teacherError) throw teacherError;

      // For each teacher, fetch their achievements
      const teachersWithAchievements = await Promise.all(
        (teachers || []).map(async (teacher) => {
          const { data: achievements, error: achievementError } = await supabase
            .from("achievements")
            .select(`
              id,
              achievement_type,
              title,
              date_achieved,
              status,
              sci_papers,
              scopus_papers,
              ugc_papers,
              patents_count,
              research_area,
              links,
              issuing_organization,
              google_scholar_link,
              scopus_id_link,
              book_drive_link,
              book_details,
              book_chapters,
              patent_link,
              patents_remarks,
              funded_projects,
              research_collaboration,
              awards_recognitions,
              consultancy_services,
              startup_details,
              general_remarks,
              q_papers,
              research_remarks
            `)
            .eq("teacher_id", teacher.id)
            .order("date_achieved", { ascending: false });

          if (achievementError) {
            console.error("Error fetching achievements for teacher:", teacher.eid, achievementError);
            return { ...teacher, achievements: [] };
          }
          return { ...teacher, achievements: achievements || [] };
        })
      );

      setState((prev) => ({
        ...prev,
        teachers: teachersWithAchievements,
        loading: false,
      }));
      console.log("Successfully fetched teachers:", teachersWithAchievements.length);
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      setState((prev) => ({
        ...prev,
        error: `Error fetching teachers data: ${error.message}. Please try again.`,
        loading: false,
      }));
      toast.error(`Failed to load teachers data: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = state.teachers.filter((teacher) => {
    const matchesSearch =
      teacher.full_name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      teacher.eid.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesDepartment =
      state.departmentFilter === "all" || teacher.department === state.departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Export teacher achievements in CSV, PDF, or DOCS
  const exportTeacherData = (teacher: Teacher, format: string) => {
    if (format === "csv") {
      const achievementsData =
        teacher.achievements?.map((a) => ({
          Type: a.achievement_type,
          Title: a.title,
          Date: a.date_achieved ? dateFormat(new Date(a.date_achieved), "yyyy-MM-dd") : "",
          Status: a.status,
          "SCI Papers": a.sci_papers || "",
          "Scopus Papers": a.scopus_papers || "",
          "UGC Papers": a.ugc_papers || "",
          "Patent Count": a.patents_count || "",
          "Research Area": a.research_area || "",
        })) || [];

      const headers = Object.keys(achievementsData[0] || {}).join(",");
      const rows = achievementsData.map((obj) => Object.values(obj).join(",")).join("\n");
      const csv = `${headers}\n${rows}`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${teacher.eid}_achievements.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.text(`Teacher: ${teacher.full_name}`, 10, 10);
      let y = 20;
      teacher.achievements.forEach((a, index) => {
        doc.text(
          `${index + 1}. ${a.title} - ${a.achievement_type} - ${a.date_achieved}`,
          10,
          y
        );
        y += 10;
      });
      doc.save(`${teacher.eid}_achievements.pdf`);
    } else if (format === "docs") {
      const content = `Teacher: ${teacher.full_name}\n` +
                      teacher.achievements.map((a, index) => 
                        `${index + 1}. ${a.title} - ${a.achievement_type} - ${a.date_achieved}`
                      ).join("\n");
      const blob = new Blob([content], { type: "application/msword" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${teacher.eid}_achievements.doc`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Update teacher details in teacher_details table
  const handleTeacherUpdate = async () => {
    if (!selectedTeacher) return;
    try {
      const { error } = await supabase
        .from("teacher_details")
        .update({
          full_name: selectedTeacher.full_name,
          department: selectedTeacher.department,
          eid: selectedTeacher.eid,
          designation: selectedTeacher.designation,
          email_id: selectedTeacher.email_id,
          mobile_number: selectedTeacher.mobile_number,
          highest_qualification: selectedTeacher.highest_qualification,
          date_of_joining: selectedTeacher.date_of_joining,
          address: selectedTeacher.address,
          profile_pic_url: selectedTeacher.profile_pic_url,
        })
        .eq("id", selectedTeacher.id);
      if (error) {
        toast.error("Error updating teacher details: " + error.message);
      } else {
        toast.success("Teacher details updated");
        fetchTeachers();
        setSelectedTeacher(null);
      }
    } catch (error: any) {
      toast.error("Error processing request: " + error.message);
    }
  };

  // Update individual achievement in achievements table
  const handleAchievementUpdate = async (achievement: Achievement) => {
    try {
      const { error } = await supabase
        .from("achievements")
        .update({
          achievement_type: achievement.achievement_type,
          title: achievement.title,
          date_achieved: achievement.date_achieved,
          status: achievement.status,
          sci_papers: achievement.sci_papers,
          scopus_papers: achievement.scopus_papers,
          ugc_papers: achievement.ugc_papers,
          patents_count: achievement.patents_count,
          research_area: achievement.research_area,
          links: achievement.links,
          issuing_organization: achievement.issuing_organization,
          google_scholar_link: achievement.google_scholar_link,
          scopus_id_link: achievement.scopus_id_link,
          book_drive_link: achievement.book_drive_link,
          book_details: achievement.book_details,
          book_chapters: achievement.book_chapters,
          patent_link: achievement.patent_link,
          patents_remarks: achievement.patents_remarks,
          funded_projects: achievement.funded_projects,
          research_collaboration: achievement.research_collaboration,
          awards_recognitions: achievement.awards_recognitions,
          consultancy_services: achievement.consultancy_services,
          startup_details: achievement.startup_details,
          general_remarks: achievement.general_remarks,
          q_papers: achievement.q_papers,
          research_remarks: achievement.research_remarks,
        })
        .eq("id", achievement.id);
      if (error) {
        toast.error("Error updating achievement: " + error.message);
      } else {
        toast.success("Achievement updated");
        fetchTeachers();
      }
    } catch (error: any) {
      toast.error("Error processing request: " + error.message);
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-lg">Loading teachers data...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500">{state.error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search teachers..."
            className="pl-10"
            value={state.searchQuery}
            onChange={(e) =>
              setState((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
          />
        </div>
        <Select
          value={state.departmentFilter}
          onValueChange={(value) =>
            setState((prev) => ({ ...prev, departmentFilter: value }))
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {Array.from(new Set(state.teachers.map((t) => t.department))).map(
              (dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {filteredTeachers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No teachers found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{teacher.full_name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost">Export</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportTeacherData(teacher, "csv")}>
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportTeacherData(teacher, "pdf")}>
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportTeacherData(teacher, "docs")}>
                        Export as DOCS
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold">EID: {teacher.eid}</p>
                    <p>Department: {teacher.department}</p>
                    <p>Designation: {teacher.designation}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Achievements</h4>
                    {teacher.achievements?.length === 0 ? (
                      <p className="text-gray-500">No achievements yet</p>
                    ) : (
                      teacher.achievements.map((achievement) => (
                        <div key={achievement.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-gray-600">
                            Type: {achievement.achievement_type}
                          </p>
                          <p className="text-sm text-gray-600">
                            Date:{" "}
                            {achievement.date_achieved
                              ? dateFormat(new Date(achievement.date_achieved), "PP")
                              : "N/A"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Status: {achievement.status}
                          </p>
                          {achievement.links && (
                            <div className="mt-2">
                              <a
                                href={achievement.links}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Details
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <Button onClick={() => setSelectedTeacher(teacher)} variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editable Teacher Details Modal (with scrollable content) */}
      {selectedTeacher && (
        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Teacher Details</DialogTitle>
            </DialogHeader>
            {/* Wrap content in a scrollable container */}
            <div className="max-h-[80vh] overflow-y-auto space-y-4">
              {/* Teacher Info */}
              <div>
                <label className="block font-medium">Full Name</label>
                <Input
                  value={selectedTeacher.full_name}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, full_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">EID</label>
                <Input
                  value={selectedTeacher.eid}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, eid: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Department</label>
                <Input
                  value={selectedTeacher.department}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, department: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Designation</label>
                <Input
                  value={selectedTeacher.designation}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, designation: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Email</label>
                <Input
                  value={selectedTeacher.email_id || ""}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, email_id: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Mobile Number</label>
                <Input
                  value={selectedTeacher.mobile_number || ""}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, mobile_number: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Highest Qualification</label>
                <Input
                  value={selectedTeacher.highest_qualification || ""}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, highest_qualification: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Date of Joining</label>
                <Input
                  type="date"
                  value={
                    selectedTeacher.date_of_joining
                      ? new Date(selectedTeacher.date_of_joining).toISOString().slice(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, date_of_joining: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Address</label>
                <Input
                  value={selectedTeacher.address || ""}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, address: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block font-medium">Profile Pic URL</label>
                <Input
                  value={selectedTeacher.profile_pic_url || ""}
                  onChange={(e) =>
                    setSelectedTeacher({ ...selectedTeacher, profile_pic_url: e.target.value })
                  }
                />
              </div>

              {/* Achievements Section */}
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">Achievements</h3>
                {selectedTeacher.achievements.map((achievement, idx) => (
                  <div key={achievement.id} className="border p-3 rounded mb-4">
                    <div className="mb-2">
                      <label className="block font-medium">Title</label>
                      <Input
                        value={achievement.title}
                        onChange={(e) => {
                          const newAchievements = [...selectedTeacher.achievements];
                          newAchievements[idx].title = e.target.value;
                          setSelectedTeacher({ ...selectedTeacher, achievements: newAchievements });
                        }}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block font-medium">Type</label>
                      <Input
                        value={achievement.achievement_type}
                        onChange={(e) => {
                          const newAchievements = [...selectedTeacher.achievements];
                          newAchievements[idx].achievement_type = e.target.value;
                          setSelectedTeacher({ ...selectedTeacher, achievements: newAchievements });
                        }}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block font-medium">Date Achieved</label>
                      <Input
                        type="date"
                        value={
                          achievement.date_achieved
                            ? new Date(achievement.date_achieved).toISOString().slice(0, 10)
                            : ""
                        }
                        onChange={(e) => {
                          const newAchievements = [...selectedTeacher.achievements];
                          newAchievements[idx].date_achieved = e.target.value;
                          setSelectedTeacher({ ...selectedTeacher, achievements: newAchievements });
                        }}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block font-medium">Status</label>
                      <Input
                        value={achievement.status}
                        onChange={(e) => {
                          const newAchievements = [...selectedTeacher.achievements];
                          newAchievements[idx].status = e.target.value;
                          setSelectedTeacher({ ...selectedTeacher, achievements: newAchievements });
                        }}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAchievementUpdate(achievement)}
                    >
                      Save Achievement
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTeacher(null)}>
                Close
              </Button>
              <Button onClick={handleTeacherUpdate}>Save Teacher</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminTeachers;
