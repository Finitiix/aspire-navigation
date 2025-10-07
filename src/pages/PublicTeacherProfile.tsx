import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Award, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Users, 
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import { AchievementStats } from "@/components/teacher/AchievementStats";

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

const PublicTeacherProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [researcherIds, setResearcherIds] = useState<ResearcherIds | null>(null);
  const [points, setPoints] = useState<Points | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, [id]);

  const fetchTeacherData = async () => {
    if (!id) return;

    try {
      // Fetch teacher details
      const { data: teacherData, error: teacherError } = await supabase
        .from("teacher_details")
        .select("*")
        .eq("id", id)
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
        .eq("teacher_id", id)
        .single();

      setResearcherIds(researchData);

      // Fetch points
      const { data: pointsData } = await supabase
        .from("teacher_points")
        .select("current_points")
        .eq("teacher_id", id)
        .single();

      setPoints(pointsData);
    } catch (error) {
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Achievement Hub</h1>
            <div className="text-right">
              <p className="text-sm opacity-90">Powered by</p>
              <p className="text-2xl font-bold">Finitix</p>
            </div>
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
                {teacher.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievement Stats */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-red-600" />
            Achievement Metrics
          </h2>
          <AchievementStats teacherId={id} />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-2">© 2025 Achievement Hub</p>
            <p className="text-sm opacity-90">Built with ❤️ by Finitix</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PublicTeacherProfile;