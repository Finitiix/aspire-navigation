import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Award, Clock, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AchievementForm } from "@/components/teacher/AchievementForm";
import { PointsDisplay } from "@/components/teacher/PointsDisplay";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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

type RecentAchievement = {
  id: string;
  title: string;
  category: string;
  date_achieved: string;
  status: string;
};

type DetailedAchievement = {
  id: string;
  category: string;
  title: string;
  date_achieved: string;
  status: string;
  document_url: string;
  q_ranking?: string;
  indexed_in?: string[];
  [key: string]: any;
};

const TeacherHome = () => {
  const [messages, setMessages] = useState({
    important_messages: [],
    important_details: [],
  });
  const [isAchievementFormOpen, setIsAchievementFormOpen] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [showTimetable, setShowTimetable] = useState(false);
  const [recentAchievements, setRecentAchievements] = useState<RecentAchievement[]>([]);
  const [overallAchievements, setOverallAchievements] = useState<DetailedAchievement[]>([]);

  useEffect(() => {
    fetchMessages();
    fetchTeacherDetails();
    fetchRecentAchievements();
    fetchOverallAchievements();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase.from("important_messages").select("*");
      const { data: detailsData, error: detailsError } = await supabase.from("important_details").select("*");

      if (error || detailsError) {
        console.error("Error fetching messages:", error || detailsError);
        return;
      }

      setMessages({
        important_messages: messagesData || [],
        important_details: detailsData || [],
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchTeacherDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("teacher_details")
          .select("*")
          .eq("id", user.id)
          .single();

        if (data) {
          setTeacherDetails(data);
        }
      }
    } catch (error) {
      console.error("Error fetching teacher details:", error);
    }
  };

  const fetchRecentAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("detailed_achievements")
          .select("id, title, category, date_achieved, status")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching recent achievements:", error);
          return;
        }

        setRecentAchievements(data || []);
      }
    } catch (error) {
      console.error("Error fetching recent achievements:", error);
    }
  };

  const fetchOverallAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("detailed_achievements")
          .select("*")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching overall achievements:", error);
          return;
        }
        setOverallAchievements(data || []);
      }
    } catch (error) {
      console.error("Error fetching overall achievements:", error);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const teacherStats = computeTeacherStats(overallAchievements);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Points Display */}
      {teacherDetails && (
        <div className="mb-8">
          <PointsDisplay teacherDepartment={teacherDetails.department} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="bg-red-100 p-1.5 rounded-full">
                <Clock className="w-5 h-5 text-red-500" />
              </div>
              Important Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            {messages.important_messages.length > 0 ? (
              messages.important_messages.map((msg: any, index) => (
                <div key={index} className="flex items-start gap-3 mb-4 leading-relaxed">
                  <div className="min-w-6 text-gray-500">•</div>
                  <p className="text-gray-700 leading-relaxed">{msg.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No important messages</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Dialog open={isAchievementFormOpen} onOpenChange={setIsAchievementFormOpen}>
            <DialogTrigger asChild>
              <Button className="w-full py-8 bg-[#ea384c] hover:bg-red-700 text-white font-bold rounded-lg text-lg">
                <Award className="w-6 h-6 mr-2" />
                Add Achievement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Achievement</DialogTitle>
              </DialogHeader>
              <AchievementForm onSuccess={() => setIsAchievementFormOpen(false)} />
            </DialogContent>
          </Dialog>

          <Card className="shadow-md hover:shadow-lg transition-all duration-300 flex-grow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="bg-red-100 p-1.5 rounded-full">
                  <Clock className="w-5 h-5 text-red-500" />
                </div>
                Important Details
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[300px] overflow-y-auto">
              {messages.important_details.length > 0 ? (
                messages.important_details.map((detail: any, index) => (
                  <div key={index} className="flex items-start gap-3 mb-4 leading-relaxed">
                    <div className="min-w-6 text-gray-500">•</div>
                    <p className="text-gray-700 leading-relaxed">{detail.detail}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No important details</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-8">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
          <CardTitle className="text-2xl font-bold text-white">Overall Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={Object.entries(teacherStats.categories).map(([name, value]) => ({ name, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {Object.entries(teacherStats.categories).map((entry, index) => {
                      const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#33AA77", "#7755AA", "#AA5577", "#55AA77"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
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

      <Card className="shadow-md hover:shadow-lg transition-all duration-300 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-red-100 p-1.5 rounded-full">
              <Award className="w-5 h-5 text-red-500" />
            </div>
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length > 0 ? (
            <div className="space-y-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="border border-gray-200 rounded-md p-4 hover:shadow-sm transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{achievement.title}</h3>
                      <p className="text-sm text-gray-600">{achievement.category}</p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(achievement.date_achieved), "PPP")}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(achievement.status)}`}>
                      {getStatusIcon(achievement.status)}
                      <span className="ml-1">{achievement.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-6">No recent achievements found. Click "Add Achievement" to add your first achievement.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md hover:shadow-lg transition-all duration-300 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="bg-red-100 p-1.5 rounded-full">
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            My Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          {teacherDetails?.timetable_url ? (
            <Button
              className="w-full bg-[#ea384c] hover:bg-red-700 text-white font-bold py-3 rounded-lg"
              onClick={() => setShowTimetable(true)}
            >
              View Timetable
            </Button>
          ) : (
            <p className="text-gray-600 text-center">No timetable available</p>
          )}
        </CardContent>
      </Card>

      {showTimetable && teacherDetails?.timetable_url && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowTimetable(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={teacherDetails.timetable_url}
              alt="Timetable"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}

      {/* From Finitix Branding */}
      <div className="text-center py-6 mt-8">
        <p className="text-sm text-gray-500">
          From{" "}
          <a 
            href="https://www.finitix.site/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Finitix
          </a>
        </p>
      </div>
    </div>
  );
};

export default TeacherHome;
