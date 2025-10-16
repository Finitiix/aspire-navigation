import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ExternalLink, 
  Award, 
  Briefcase, 
  Users, 
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download
} from "lucide-react";
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

interface TeacherData {
  id: string;
  full_name: string;
  designation: string;
  department: string;
  email_id: string;
  mobile_number: string;
  profile_pic_url?: string;
  tagline?: string;
  bio?: string;
  experience?: any;
  github_url?: string;
  linkedin_url?: string;
  personal_website?: string;
  skills?: any;
  date_of_joining: string;
  highest_qualification: string;
}

interface ResearcherIds {
  google_scholar_id?: string;
  scopus_author_id?: string;
  orcid?: string;
  web_of_science_id?: string;
}

interface Points {
  current_points: number;
}

interface Achievement {
  id: string;
  category: string;
  title: string;
  date_achieved: string;
  status: string;
  document_url?: string;
  q_ranking?: string;
  indexed_in?: string[];
  journal_name?: string;
  conference_name?: string;
  book_title?: string;
  patent_number?: string;
  award_name?: string;
  doi?: string;
  publisher?: string;
  [key: string]: any;
}

const PublicTeacherProfile = () => {
  const { eid } = useParams<{ eid: string }>();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [researcherIds, setResearcherIds] = useState<ResearcherIds | null>(null);
  const [points, setPoints] = useState<Points | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, [eid]);

  const fetchTeacherData = async () => {
    if (!eid) return;

    try {
      // Fetch teacher details by EID
      const { data: teacherData, error: teacherError } = await supabase
        .from("teacher_details")
        .select("*")
        .eq("eid", eid)
        .single();

      if (teacherError) throw teacherError;
      
      // Parse experience and skills if they're JSON
      const parsedTeacher = {
        ...teacherData,
        experience: teacherData.experience 
          ? (typeof teacherData.experience === 'string' 
            ? JSON.parse(teacherData.experience) 
            : Array.isArray(teacherData.experience) 
              ? teacherData.experience 
              : [])
          : [],
        skills: teacherData.skills
          ? (typeof teacherData.skills === 'string'
            ? (teacherData.skills as string).split(',').map((s: string) => s.trim())
            : Array.isArray(teacherData.skills)
              ? teacherData.skills
              : [])
          : []
      };
      
      setTeacher(parsedTeacher);

      // Fetch researcher IDs
      const { data: researchData } = await supabase
        .from("researcher_ids")
        .select("*")
        .eq("teacher_id", teacherData.id)
        .single();

      setResearcherIds(researchData);

      // Fetch points
      const { data: pointsData } = await supabase
        .from("teacher_points")
        .select("current_points")
        .eq("teacher_id", teacherData.id)
        .single();

      setPoints(pointsData);

      // Fetch approved achievements
      const { data: achievementsData } = await supabase
        .from("detailed_achievements")
        .select("*")
        .eq("teacher_id", teacherData.id)
        .eq("status", "Approved")
        .order("date_achieved", { ascending: false });

      setAchievements(achievementsData || []);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = (achievements: Achievement[]) => {
    const stats = {
      totalDocuments: achievements.length,
      categories: {} as Record<string, number>,
      yearly: {} as Record<number, number>,
      quality: {
        Q1: 0,
        Q2: 0,
        Q3: 0,
        Q4: 0,
      },
    };

    achievements.forEach((achievement) => {
      // Count by category
      if (achievement.category) {
        stats.categories[achievement.category] = (stats.categories[achievement.category] || 0) + 1;
      }
      
      // Count by year
      if (achievement.date_achieved) {
        const year = new Date(achievement.date_achieved).getFullYear();
        stats.yearly[year] = (stats.yearly[year] || 0) + 1;
      }
      
      // Count by quality
      if (achievement.q_ranking && stats.quality[achievement.q_ranking as keyof typeof stats.quality] !== undefined) {
        stats.quality[achievement.q_ranking as keyof typeof stats.quality]++;
      }
    });

    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">This teacher profile does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const researchLinks = [
    { name: "ORCID", url: researcherIds?.orcid ? `https://orcid.org/${researcherIds.orcid}` : null, icon: "🔬" },
    { name: "Scopus", url: researcherIds?.scopus_author_id ? `https://www.scopus.com/authid/detail.uri?authorId=${researcherIds.scopus_author_id}` : null, icon: "📊" },
    { name: "Google Scholar", url: researcherIds?.google_scholar_id ? `https://scholar.google.com/citations?user=${researcherIds.google_scholar_id}` : null, icon: "🎓" },
    { name: "Web of Science", url: researcherIds?.web_of_science_id ? `https://www.webofscience.com/wos/author/record/${researcherIds.web_of_science_id}` : null, icon: "🔍" },
    { name: "GitHub", url: teacher?.github_url, icon: "💻" },
    { name: "LinkedIn", url: teacher?.linkedin_url, icon: "💼" },
    { name: "Website", url: teacher?.personal_website, icon: "🌐" },
  ].filter(link => link.url);

  const stats = computeStats(achievements);
  const categoryData = Object.entries(stats.categories).map(([name, value]) => ({ name, value }));
  const yearlyData = Object.entries(stats.yearly).map(([year, count]) => ({ year, count }));
  const qualityData = Object.entries(stats.quality).map(([quality, count]) => ({ quality, count }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#33AA77", "#7755AA", "#AA5577", "#55AA77"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Achievement Hub</h1>
            <a 
              href="https://finitix.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-right hover:opacity-90 transition-opacity"
            >
              <p className="text-sm opacity-90">Powered by</p>
              <p className="text-2xl font-bold">Finitix</p>
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header Card */}
        <Card className="mb-8 overflow-hidden shadow-xl border-0 animate-fade-in">
          <div className="bg-gradient-to-r from-red-600 to-red-700 h-32"></div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-16">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                  {teacher.profile_pic_url ? (
                    <img
                      src={teacher.profile_pic_url}
                      alt={teacher.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-4xl font-bold">
                      {teacher.full_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-grow mt-16 md:mt-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{teacher.full_name}</h1>
                    <p className="text-lg text-red-600 font-semibold mb-1">{teacher.designation}</p>
                    <p className="text-gray-600 mb-3">{teacher.department}</p>
                    {teacher.tagline && (
                      <p className="text-gray-700 italic">"{teacher.tagline}"</p>
                    )}
                  </div>

                  {/* Points Badge */}
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-full shadow-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{points?.current_points || 0}</div>
                        <div className="text-sm font-medium">Points</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${teacher.email_id}`} className="hover:text-red-600 transition-colors">
                      {teacher.email_id}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{teacher.mobile_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined: {new Date(teacher.date_of_joining).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>{teacher.highest_qualification}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Links */}
        {researchLinks.length > 0 && (
          <Card className="mb-8 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-red-600" />
                Research & Professional Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {researchLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Button
                      variant="outline"
                      className="hover:bg-red-50 hover:border-red-600 hover:text-red-600 transition-all duration-300 hover:scale-105"
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* About & Experience */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* About */}
          {teacher.bio && (
            <Card className="shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{teacher.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {teacher.experience && teacher.experience.length > 0 && (
            <Card className="shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-600" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacher.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-red-600 pl-4">
                      <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                      <p className="text-gray-600">{exp.institution}</p>
                      <p className="text-sm text-gray-500">{exp.years}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Skills */}
        {teacher.skills && teacher.skills.length > 0 && (
          <Card className="mb-8 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {teacher.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievement Metrics */}
        {achievements.length > 0 && (
          <>
            <Card className="mb-8 shadow-lg animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Achievement Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-700">Total Achievements</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalDocuments}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie 
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Yearly Achievements</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={yearlyData}>
                        <XAxis dataKey="year" stroke="#333" />
                        <YAxis stroke="#333" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {qualityData.some(d => d.count > 0) && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Quality Ranking (Q1 - Q4)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={qualityData}>
                        <XAxis dataKey="quality" stroke="#333" />
                        <YAxis stroke="#333" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievement List */}
            <Card className="mb-8 shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  All Achievements ({achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-red-300"
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg text-gray-900">{achievement.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{achievement.category}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(achievement.date_achieved).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {achievement.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-2">© 2025 Achievement Hub</p>
            <p className="text-sm opacity-90">
              From{" "}
              <a 
                href="https://finitix.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:opacity-80 transition-opacity"
              >
                Finitix
              </a>
            </p>
          </div>
        </footer>
      </div>

      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedAchievement?.title}</DialogTitle>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Category</p>
                  <p className="text-gray-900">{selectedAchievement.category}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Date Achieved</p>
                  <p className="text-gray-900">{new Date(selectedAchievement.date_achieved).toLocaleDateString()}</p>
                </div>
                {selectedAchievement.journal_name && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Journal</p>
                    <p className="text-gray-900">{selectedAchievement.journal_name}</p>
                  </div>
                )}
                {selectedAchievement.conference_name && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Conference</p>
                    <p className="text-gray-900">{selectedAchievement.conference_name}</p>
                  </div>
                )}
                {selectedAchievement.publisher && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Publisher</p>
                    <p className="text-gray-900">{selectedAchievement.publisher}</p>
                  </div>
                )}
                {selectedAchievement.doi && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">DOI</p>
                    <a href={`https://doi.org/${selectedAchievement.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedAchievement.doi}
                    </a>
                  </div>
                )}
                {selectedAchievement.q_ranking && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Q Ranking</p>
                    <Badge variant="secondary">{selectedAchievement.q_ranking}</Badge>
                  </div>
                )}
              </div>

              {selectedAchievement.indexed_in && selectedAchievement.indexed_in.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">Indexed In</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAchievement.indexed_in.map((index: string, i: number) => (
                      <Badge key={i} variant="outline">{index}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAchievement.document_url && (
                <div className="pt-4 border-t">
                  <a
                    href={selectedAchievement.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    View/Download Document
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicTeacherProfile;