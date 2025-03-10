
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type StatsProps = {
  teacherId?: string;
};

export const AchievementStats = ({ teacherId }: StatsProps) => {
  const [stats, setStats] = useState({
    journalArticles: 0,
    conferencesPapers: 0,
    booksChapters: 0,
    patents: 0,
    collaborations: 0,
    awards: 0,
    projects: 0,
    startups: 0,
    others: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const userId = teacherId || user?.id;
        
        if (!userId) return;

        // Fetch all achievements for counting
        const { data, error } = await supabase
          .from('detailed_achievements')
          .select('category')
          .eq('teacher_id', userId);

        if (error) throw error;

        // Count by category
        const counts = {
          journalArticles: 0,
          conferencesPapers: 0,
          booksChapters: 0,
          patents: 0,
          collaborations: 0,
          awards: 0,
          projects: 0,
          startups: 0,
          others: 0,
          total: data.length,
        };

        data.forEach((item) => {
          switch (item.category) {
            case 'Journal Articles':
              counts.journalArticles++;
              break;
            case 'Conference Papers':
              counts.conferencesPapers++;
              break;
            case 'Books & Book Chapters':
              counts.booksChapters++;
              break;
            case 'Patents':
              counts.patents++;
              break;
            case 'Research Collaborations':
              counts.collaborations++;
              break;
            case 'Awards & Recognitions':
              counts.awards++;
              break;
            case 'Consultancy & Funded Projects':
              counts.projects++;
              break;
            case 'Startups & Centers of Excellence':
              counts.startups++;
              break;
            case 'Others':
              counts.others++;
              break;
          }
        });

        setStats(counts);
      } catch (error) {
        console.error('Error fetching achievement stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [teacherId]);

  const statItems = [
    { name: 'Journals', value: stats.journalArticles, color: 'bg-blue-100 text-blue-800' },
    { name: 'Conferences', value: stats.conferencesPapers, color: 'bg-green-100 text-green-800' },
    { name: 'Books', value: stats.booksChapters, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Patents', value: stats.patents, color: 'bg-purple-100 text-purple-800' },
    { name: 'Collaborations', value: stats.collaborations, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Awards', value: stats.awards, color: 'bg-pink-100 text-pink-800' },
    { name: 'Projects', value: stats.projects, color: 'bg-teal-100 text-teal-800' },
    { name: 'Startups', value: stats.startups, color: 'bg-orange-100 text-orange-800' },
    { name: 'Others', value: stats.others, color: 'bg-gray-100 text-gray-800' },
  ];

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-4">Achievement Statistics</h3>
        {loading ? (
          <div className="text-center py-2">Loading statistics...</div>
        ) : (
          <div>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
              {statItems.map((item) => (
                <div key={item.name} className="text-center">
                  <div className={`inline-block px-3 py-1 rounded-full ${item.color} font-semibold`}>
                    {item.value}
                  </div>
                  <div className="text-xs mt-1">{item.name}</div>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-center">
              <div className="bg-red-100 text-red-800 px-6 py-2 rounded-full font-semibold text-center">
                Total: {stats.total}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
