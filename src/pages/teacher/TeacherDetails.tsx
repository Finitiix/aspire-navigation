
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TeacherDetails = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Additional teacher details will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDetails;
