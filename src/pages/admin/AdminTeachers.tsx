
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase
        .from('teacher_details')
        .select('*');
      
      if (data) setTeachers(data);
    };

    fetchTeachers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <Card key={teacher.id} className="p-4">
                <div className="flex items-center gap-4">
                  {teacher.profile_pic_url ? (
                    <img
                      src={teacher.profile_pic_url}
                      alt={teacher.full_name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                  )}
                  <div>
                    <h3 className="font-medium">{teacher.full_name}</h3>
                    <p className="text-sm text-gray-600">{teacher.department}</p>
                    <p className="text-sm text-gray-600">{teacher.eid}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTeachers;
