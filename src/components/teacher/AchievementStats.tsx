
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type StatProps = {
  teacherId?: string;
  className?: string;
}

export function AchievementStats({ teacherId, className = "" }: StatProps) {
  const [stats, setStats] = useState({
    journal: 0,
    conference: 0,
    book: 0,
    patent: 0,
    award: 0,
    consultancy: 0,
    startup: 0,
    other: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get current user if teacherId is not provided
        let userId = teacherId;
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id;
        }
        
        if (!userId) return;

        // Get count for each category
        const { data: journal } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Journal Articles');

        const { data: conference } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Conference Papers');

        const { data: book } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Books & Book Chapters');

        const { data: patent } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Patents');

        const { data: award } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Awards & Recognitions');

        const { data: consultancy } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Consultancy & Funded Projects');

        const { data: startup } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Startups & Centers of Excellence');

        const { data: other } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId)
          .eq('category', 'Others');

        const { count: totalCount } = await supabase
          .from('detailed_achievements')
          .select('id', { count: 'exact', head: true })
          .eq('teacher_id', userId);

        setStats({
          journal: journal?.count || 0,
          conference: conference?.count || 0,
          book: book?.count || 0,
          patent: patent?.count || 0,
          award: award?.count || 0,
          consultancy: consultancy?.count || 0,
          startup: startup?.count || 0,
          other: other?.count || 0,
          total: totalCount || 0
        });
      } catch (error) {
        console.error("Error fetching achievement stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [teacherId]);

  if (loading) {
    return <div className="h-20 flex items-center justify-center">Loading statistics...</div>;
  }

  return (
    <Card className={`mb-6 ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Achievement Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatBox label="Journal Articles" value={stats.journal} />
          <StatBox label="Conference Papers" value={stats.conference} />
          <StatBox label="Books & Chapters" value={stats.book} />
          <StatBox label="Patents" value={stats.patent} />
          <StatBox label="Awards" value={stats.award} />
          <StatBox label="Consultancy & Projects" value={stats.consultancy} />
          <StatBox label="Startups & Centers" value={stats.startup} />
          <StatBox label="Others" value={stats.other} />
          <StatBox label="Total Achievements" value={stats.total} highlight />
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-blue-600' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}
