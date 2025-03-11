import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, X, Eye, ExternalLink, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format as dateFormat } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

type Teacher = {
  id: string;
  full_name: string;
  email_id: string;
  department: string;
  designation: string;
  mobile_number: string;
  eid: string;
  profile_pic_url: string | null;
  // Additional teacher details as per the teacher_details table
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

type DetailedAchievement = {
  id: string;
  category: string;
  title: string;
  date_achieved: string;
  status: string;
  document_url: string;
  // Additional fields for statistics
  indexed_in?: string[];
  q_ranking?: "Q1" | "Q2" | "Q3" | "Q4";
  [key: string]: any;
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
    // Category breakdown
    if (achievement.category && stats.categories[achievement.category] !== undefined) {
      stats.categories[achievement.category]++;
    }
    // Yearly breakdown based on date_achieved
    if (achievement.date_achieved) {
      const year = new Date(achievement.date_achieved).getFullYear();
      if ([2022, 2023, 2024, 2025].includes(year)) {
        stats.yearly[year]++;
      }
    }
    // Quality ranking breakdown
    if (achievement.q_ranking && stats.quality[achievement.q_ranking] !== undefined) {
      stats.quality[achievement.q_ranking]++;
    }
    // Indexed documents breakdown using indexed_in array
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

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewDocumentUrl, setViewDocumentUrl] = useState<string | null>(null);

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
        
        setSelectedTeacher({
          ...selectedTeacher,
          achievements: updatedAchievements,
        });

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
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teacher Management</h1>
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
            <DialogTitle>Teacher Details</DialogTitle>
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
                    <p>{selectedTeacher.date_of_joining ? dateFormat(new Date(selectedTeacher.date_of_joining), "PPP") : "Not provided"}</p>
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
                        <CardTitle className="text-2xl font-bold text-white">Teacher Document Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {/* Top Stats Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700">Total Documents Uploaded</h3>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{teacherStats.totalDocuments}</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700">Indexed Documents</h3>
                            <ul className="mt-2 space-y-1">
                              {Object.entries(teacherStats.indexed).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                  <span>{key}</span>
                                  <span className="font-semibold text-blue-600">{value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700">Yearly Uploads</h3>
                            <ul className="mt-2 space-y-1">
                              {Object.entries(teacherStats.yearly).map(([year, count]) => (
                                <li key={year} className="flex justify-between">
                                  <span>{year}</span>
                                  <span className="font-semibold text-blue-600">{count}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Category Breakdown */}
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Category Breakdown</h3>
                            <div className="mt-4">
                              <h3 className="text-md font-semibold text-gray-700">Category Details</h3>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(teacherStats.categories).map(([cat, count]) => (
                                  <div key={cat} className="flex justify-between items-center p-2 border rounded bg-white">
                                    <span>{cat}</span>
                                    <span className="font-bold text-blue-600">{count}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          {/* Yearly Uploads Bar Chart */}
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Yearly Uploads</h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={[
                                { year: "2022", count: teacherStats.yearly[2022] },
                                { year: "2023", count: teacherStats.yearly[2023] },
                                { year: "2024", count: teacherStats.yearly[2024] },
                                { year: "2025", count: teacherStats.yearly[2025] },
                              ]}>
                                <XAxis dataKey="year" stroke="#333" />
                                <YAxis stroke="#333" />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        {/* Quality Ranking Chart */}
                        <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
                          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Quality Ranking (Q1 - Q4)</h3>
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
                                  <AccordionTrigger className="text-sm py-2">View Achievement Details</AccordionTrigger>
                                  <AccordionContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-2">
                                      {achievement.category === 'Journal Articles' && (
                                        <>
                                          <div>
                                            <p className="text-sm font-medium">Journal Name:</p>
                                            <p className="text-sm">{renderFieldValue(achievement.journal_name)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">ISSN:</p>
                                            <p className="text-sm">{renderFieldValue(achievement.issn)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">DOI:</p>
                                            <p className="text-sm">{renderFieldValue(achievement.doi)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">Journal Link:</p>
                                            <p className="text-sm">{renderFieldValue(achievement.journal_link, true)}</p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
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
                                    <X className="h-4 w-4" />
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
                                    <AccordionTrigger className="text-sm py-2">View Achievement Details</AccordionTrigger>
                                    <AccordionContent>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-2">
                                        {achievement.category === 'Journal Articles' && (
                                          <>
                                            <div>
                                              <p className="text-sm font-medium">Journal Name:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.journal_name)}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">ISSN:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.issn)}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">DOI:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.doi)}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">Journal Link:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.journal_link, true)}</p>
                                            </div>
                                          </>
                                        )}
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
                                  onClick={() => handleUpdateAchievementStatus(achievement.id, "Approved")}
                                >
                                  <X className="h-4 w-4" />
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
                                    <AccordionTrigger className="text-sm py-2">View Achievement Details</AccordionTrigger>
                                    <AccordionContent>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mt-2">
                                        {achievement.category === 'Journal Articles' && (
                                          <>
                                            <div>
                                              <p className="text-sm font-medium">Journal Name:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.journal_name)}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">ISSN:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.issn)}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">DOI:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.doi)}</p>
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium">Journal Link:</p>
                                              <p className="text-sm">{renderFieldValue(achievement.journal_link, true)}</p>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                Approved
                              </span>
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

export default AdminTeachers;
