import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, Calendar, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format, isAfter } from "date-fns";

interface TeacherPoints {
  current_points: number;
}

interface DepartmentTarget {
  target_points: number;
  target_date: string;
  benefits: string[];
}

interface PointsDisplayProps {
  teacherDepartment: string;
}

export const PointsDisplay = ({ teacherDepartment }: PointsDisplayProps) => {
  const [points, setPoints] = useState<TeacherPoints | null>(null);
  const [target, setTarget] = useState<DepartmentTarget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPointsData();
  }, [teacherDepartment]);

  const fetchPointsData = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Fetch current points
      const { data: pointsData } = await supabase
        .from('teacher_points')
        .select('current_points')
        .eq('teacher_id', userId)
        .single();

      setPoints(pointsData || { current_points: 0 });

      // Fetch department target
      const { data: targetData } = await supabase
        .from('department_targets')
        .select('target_points, target_date, benefits')
        .eq('department_id', teacherDepartment)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setTarget(targetData);
    } catch (error) {
      console.error('Error fetching points data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPoints = points?.current_points || 0;
  const targetPoints = target?.target_points || 0;
  const isTargetActive = target && isAfter(new Date(target.target_date), new Date());
  const hasMetTarget = currentPoints >= targetPoints;
  const pointsColor = hasMetTarget ? "text-green-600" : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Current Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Current Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-bold", pointsColor)}>
              {currentPoints}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Points earned from achievements
            </p>
          </CardContent>
        </Card>

        {/* Target Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            {target && isTargetActive ? (
              <>
                <div className="text-3xl font-bold text-blue-600">
                  {targetPoints}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Due: {format(new Date(target.target_date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <Badge 
                  variant={hasMetTarget ? "default" : "secondary"}
                  className="mt-2"
                >
                  {hasMetTarget ? "Target Achieved!" : "In Progress"}
                </Badge>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-muted-foreground">No active target</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Contact your department admin for target information
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      {target?.benefits && target.benefits.length > 0 && isTargetActive && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Benefits for Achieving Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {target.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-sm">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};