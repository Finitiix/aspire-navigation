
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TeacherHome = () => {
  const handleCECClick = () => {
    window.location.href = "https://cec-aiml.vercel.app/";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Welcome to CEC AIML</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCECClick} className="w-full">
              Access CEC AIML Platform
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Button variant="link" onClick={() => window.location.href = "/teacher-dashboard/profile"}>
                  View Profile
                </Button>
              </li>
              <li>
                <Button variant="link" onClick={() => window.location.href = "/teacher-dashboard/achievements"}>
                  View Achievements
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherHome;
