import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeacherUser {
  id: string;
  eid: string;
  password: string;
}

const UserManagement = () => {
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [newEid, setNewEid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeacherUsers();
  }, []);

  const fetchTeacherUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_users')
        .select('*');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teacher users:', error);
      toast.error('Failed to load teacher users');
    }
  };

  const createTeacherUser = async () => {
    if (!newEid.match(/^E\d{5}$/)) {
      toast.error('EID must be in format EXXXXX where X is a number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('teacher_users')
        .insert([
          {
            eid: newEid,
            password: newPassword,
          }
        ]);

      if (error) throw error;
      
      toast.success('Teacher user created successfully');
      setNewEid("");
      setNewPassword("");
      fetchTeacherUsers();
    } catch (error) {
      console.error('Error creating teacher user:', error);
      toast.error('Failed to create teacher user');
    } finally {
      setLoading(false);
    }
  };

  const updateTeacherPassword = async (teacherId: string, newPassword: string) => {
    try {
      const { error } = await supabase
        .from('teacher_users')
        .update({ password: newPassword })
        .eq('id', teacherId);

      if (error) throw error;
      toast.success('Password updated successfully');
      fetchTeacherUsers();
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Teacher User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Create New Teacher User */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Create New Teacher User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">EID (EXXXXX format)</label>
                  <Input
                    value={newEid}
                    onChange={(e) => setNewEid(e.target.value)}
                    placeholder="E12345"
                    pattern="E\d{5}"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <Button
                  onClick={createTeacherUser}
                  disabled={loading || !newEid || !newPassword}
                >
                  {loading ? 'Creating...' : 'Create Teacher User'}
                </Button>
              </div>
            </div>

            {/* Existing Teacher Users */}
            <div>
              <h3 className="text-lg font-medium mb-4">Existing Teacher Users</h3>
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{teacher.eid}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="password"
                          placeholder="New password"
                          className="w-48"
                          onChange={(e) => {
                            const newPass = e.target.value;
                            if (newPass) {
                              updateTeacherPassword(teacher.id, newPass);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
