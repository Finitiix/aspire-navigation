
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeachers = async () => {
      const { data } = await supabase
        .from('teacher_details')
        .select(`
          *,
          achievements (
            id,
            achievement_type,
            title,
            date_achieved,
            status,
            issuing_organization
          )
        `);
      
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
          <div className="space-y-4">
            {teachers.map((teacher) => (
              <Accordion key={teacher.id} type="single" collapsible>
                <AccordionItem value="details">
                  <AccordionTrigger className="px-4">
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
                      <div className="text-left">
                        <h3 className="font-medium">{teacher.full_name}</h3>
                        <p className="text-sm text-gray-600">{teacher.department}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                      <div>
                        <h4 className="font-medium mb-2">Profile Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">EID:</span> {teacher.eid}</p>
                          <p><span className="font-medium">Designation:</span> {teacher.designation}</p>
                          <p><span className="font-medium">Email:</span> {teacher.email_id}</p>
                          <p><span className="font-medium">Mobile:</span> {teacher.mobile_number}</p>
                          <p><span className="font-medium">Qualification:</span> {teacher.highest_qualification}</p>
                          <p><span className="font-medium">Joined:</span> {new Date(teacher.date_of_joining).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Achievements</h4>
                        <div className="space-y-2">
                          {teacher.achievements?.map((achievement: any) => (
                            <Card key={achievement.id} className="p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{achievement.title}</p>
                                  <p className="text-sm text-gray-600">{achievement.achievement_type}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  achievement.status === 'Approved' 
                                    ? 'bg-green-100 text-green-800'
                                    : achievement.status === 'Rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {achievement.status}
                                </span>
                              </div>
                            </Card>
                          ))}
                          {(!teacher.achievements || teacher.achievements.length === 0) && (
                            <p className="text-gray-600">No achievements recorded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTeachers;
