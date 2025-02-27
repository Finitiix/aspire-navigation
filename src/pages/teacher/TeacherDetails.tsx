import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimetable, setSelectedTimetable] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase
        .from('teacher_details')
        .select('profile_pic_url, full_name, eid, designation, cabin_no, block, timetable_url');
      
      if (data) setTeachers(data);
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.eid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.cabin_no && teacher.cabin_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (teacher.block && teacher.block.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Box */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-lg"> {/* Responsive Width */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search by name, EID, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
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
                  <Button
                    variant="default"
                    className="mt-3"
                    onClick={() => setSelectedTimetable(teacher.timetable_url)}
                  >
                    View Timetable
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timetable Modal */}
      {selectedTimetable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setSelectedTimetable(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={selectedTimetable}
              alt="Timetable"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDetails;
