
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const TeacherDetailsForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eid: "",
    profile_pic_url: "",
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const skills = formData.skills.split(',').map(skill => skill.trim());
      
      const { error } = await supabase
        .from('teacher_details')
        .insert({
          id: user.id,
          ...formData,
          skills,
        });

      if (error) throw error;

      toast.success("Details saved successfully!");
      navigate("/teacher-dashboard");
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

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
