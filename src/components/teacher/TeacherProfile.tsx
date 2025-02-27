import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, X } from "lucide-react";

type TeacherProfileData = {
  full_name: string;
  designation: string;
  department: string;
  mobile_number: string;
  email_id: string;
  gender: string;
  date_of_joining: string;
  highest_qualification: string;
  skills: string;
  address: string;
  cabin_no: string;
  eid: string;
  profile_pic_url: string;
  block: string;
  timetable_url: string;
};

export const TeacherProfile = () => {
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TeacherProfileData>({
    full_name: "",
    designation: "",
    department: "",
    mobile_number: "",
    email_id: "",
    gender: "",
    date_of_joining: "",
    highest_qualification: "",
    skills: "",
    address: "",
    cabin_no: "",
    profile_pic_url: "",
    eid: "",
    block: "",
    timetable_url: "",
  });
  const [showTimetable, setShowTimetable] = useState(false);

  useEffect(() => {
    fetchTeacherDetails();
  }, []);

  const fetchTeacherDetails = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('teacher_details')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setTeacherDetails(data);
        setFormData({
          ...data,
          skills: data.skills ? data.skills.join(", ") : "",
          block: data.block || "",
          timetable_url: data.timetable_url || "",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updatedData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()),
      };

      const { error } = await supabase
        .from('teacher_details')
        .update(updatedData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Details updated successfully!");
      setIsEditing(false);
      await fetchTeacherDetails();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!teacherDetails) return null;

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Teacher Profile</CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">EID *</label>
                  <Input
                    required
                    name="eid"
                    value={formData.eid}
                    onChange={handleChange}
                    placeholder="EXXXXX"
                    pattern="^E\d{5}$"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Picture URL *</label>
                  <Input
                    required
                    name="profile_pic_url"
                    value={formData.profile_pic_url}
                    onChange={handleChange}
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Designation *</label>
                  <Input
                    required
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department *</label>
                  <Input
                    required
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number *</label>
                  <Input
                    required
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email ID *</label>
                  <Input
                    required
                    name="email_id"
                    value={formData.email_id}
                    onChange={handleChange}
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender *</label>
                  <select
                    required
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Joining *</label>
                  <Input
                    required
                    name="date_of_joining"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Highest Qualification *</label>
                  <Input
                    required
                    name="highest_qualification"
                    value={formData.highest_qualification}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <Input
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="Comma separated skills"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cabin No</label>
                  <Input
                    name="cabin_no"
                    value={formData.cabin_no}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Block</label>
                  <Input
                    name="block"
                    value={formData.block}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timetable URL</label>
                  <Input
                    type="url"
                    name="timetable_url"
                    value={formData.timetable_url}
                    onChange={handleChange}
                    placeholder="Optional - Link to your timetable"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={teacherDetails.profile_pic_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Basic Information</h3>
                  <p><span className="text-gray-600">EID:</span> {teacherDetails.eid}</p>
                  <p><span className="text-gray-600">Name:</span> {teacherDetails.full_name}</p>
                  <p><span className="text-gray-600">Designation:</span> {teacherDetails.designation}</p>
                  <p><span className="text-gray-600">Department:</span> {teacherDetails.department}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Contact Information</h3>
                  <p><span className="text-gray-600">Mobile:</span> {teacherDetails.mobile_number}</p>
                  <p><span className="text-gray-600">Email:</span> {teacherDetails.email_id}</p>
                  <p><span className="text-gray-600">Cabin No:</span> {teacherDetails.cabin_no || 'N/A'}</p>
                  <p><span className="text-gray-600">Address:</span> {teacherDetails.address || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Additional Information</h3>
                  <p><span className="text-gray-600">Gender:</span> {teacherDetails.gender}</p>
                  <p><span className="text-gray-600">Date of Joining:</span> {teacherDetails.date_of_joining}</p>
                  <p><span className="text-gray-600">Qualification:</span> {teacherDetails.highest_qualification}</p>
                  <p><span className="text-gray-600">Skills:</span> {teacherDetails.skills?.join(", ") || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Block</h3>
                  <p>{teacherDetails?.block || 'Not specified'}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Timetable</h3>
                  {teacherDetails?.timetable_url ? (
                    <Button
                      variant="link"
                      className="text-primary hover:underline p-0"
                      onClick={() => setShowTimetable(true)}
                    >
                      View Timetable
                    </Button>
                  ) : (
                    <p>Not specified</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timetable Modal */}
      {showTimetable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setShowTimetable(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img
              src={teacherDetails.timetable_url}
              alt="Timetable"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
