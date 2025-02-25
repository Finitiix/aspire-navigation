
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TeacherAchievements = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Your achievements will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherAchievements;
