
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type TeacherDetail = {
  profile_pic_url: string | null;
  full_name: string;
  eid: string;
  designation: string;
  cabin_no: string | null;
  block: string | null;
  timetable_url: string | null;
};

const TeacherDetails = () => {
  const [teachers, setTeachers] = useState<TeacherDetail[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase
        .from('teacher_details')
        .select('profile_pic_url, full_name, eid, designation, cabin_no, block, timetable_url');
      
      if (data) setTeachers(data);
    };

    fetchTeachers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.eid}>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={teacher.profile_pic_url || '/placeholder.svg'}
                  alt={teacher.full_name}
                  className="w-24 h-24 rounded-full mb-4 object-cover"
                />
                <h3 className="font-bold text-lg mb-1">{teacher.full_name}</h3>
                <p className="text-gray-600 mb-1">EID: {teacher.eid}</p>
                <p className="text-gray-600 mb-1">{teacher.designation}</p>
                {teacher.cabin_no && (
                  <p className="text-gray-600 mb-1">Cabin: {teacher.cabin_no}</p>
                )}
                {teacher.block && (
                  <p className="text-gray-600 mb-1">Block: {teacher.block}</p>
                )}
                {teacher.timetable_url && (
                  <a
                    href={teacher.timetable_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline mt-2"
                  >
                    View Timetable
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherDetails;
