import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const departments = [
  "1st Year",
  "2nd Year CSE",
  "3rd Year CSE",
  "4th Year CSE",
  "UIC, BCA 1st Year",
  "UIC, BCA 2nd Year",
  "UIC, BCA 3rd Year",
  "UIC, MCA 1st Year",
  "UIC, MCA 2nd Year",
  "AIT CSE AI/ML 2nd Year",
  "AIT CSE AI/ML 3rd Year",
  "AIT CSE AI/ML 4th Year",
  "AIT CSE NON AI/ML 2nd Year",
  "AIT CSE NON AI/ML 3rd Year",
  "AIT CSE NON AI/ML 4th Year",
  "NON-CSE 2nd Year",
  "NON-CSE 3rd Year",
  "NON-CSE 4th Year",
  "ME-NON-CSE 1st Year",
  "ME-NON-CSE 2nd Year",
  "ME CSE 1st Year",
  "ME CSE 2nd Year",
  "PhD CSE",
  "PhD NON-CSE",
];

export const TeacherDetailsForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    designation: "",
    department: "",
    mobile_number: "",
    email_id: "",
    gender: "",
    date_of_joining: "",
    highest_qualification: "",
    skills: "",
    eid: "",
    profile_pic_url: "",
  });
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const profilePicRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setFormData((prev) => ({
          ...prev,
          email_id: data.user?.email || "",
          eid: data.user?.email?.split("@")[0].toUpperCase() || "",
        }));
      }
    };
    getUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = async (fileInput: HTMLInputElement) => {
    const files = fileInput.files;
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${formData.eid}_profile_${Date.now()}.${fileExt}`;
    
    try {
      setUploadingProfilePic(true);
      
      const { data, error } = await supabase.storage
        .from('teacher_information')
        .upload(`teacher_profiles/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('teacher_information')
        .getPublicUrl(`teacher_profiles/${fileName}`);
      
      setFormData(prev => ({
        ...prev,
        profile_pic_url: publicUrl
      }));
      
      toast.success(`Profile picture uploaded successfully!`);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingProfilePic(false);
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      for (const [key, value] of Object.entries(formData)) {
        if (key !== "skills" && key !== "profile_pic_url" && !value) {
          throw new Error(`Please fill in the ${key.replace("_", " ")}`);
        }
      }

      // Validate EID format
      if (!/^E\d{5}$/.test(formData.eid)) {
        throw new Error("EID must be in the format EXXXXX (e.g. E12345)");
      }

      // Get the user's id
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Prepare skills array
      const skills = formData.skills
        ? formData.skills.split(",").map((skill) => skill.trim())
        : [];

      // Create teacher record
      const { error } = await supabase.from("teacher_details").insert({
        id: userData.user.id,
        full_name: formData.full_name,
        designation: formData.designation,
        department: formData.department,
        mobile_number: formData.mobile_number,
        email_id: formData.email_id,
        gender: formData.gender,
        date_of_joining: formData.date_of_joining,
        highest_qualification: formData.highest_qualification,
        skills: skills,
        eid: formData.eid,
        profile_pic_url: formData.profile_pic_url,
      });

      if (error) throw error;

      toast.success("Teacher profile created successfully!");
      window.location.href = "/teacher-dashboard";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={profilePicRef} 
              className="hidden" 
              accept="image/*"
              onChange={() => handleFileUpload(profilePicRef.current!)}
            />
            
            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Picture</label>
              <div className="flex flex-col items-center gap-2">
                {formData.profile_pic_url && (
                  <img 
                    src={formData.profile_pic_url} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover"
                  />
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => profilePicRef.current?.click()}
                  disabled={uploadingProfilePic}
                >
                  {uploadingProfilePic ? "Uploading..." : "Upload Profile Picture"}
                  <Upload className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">EID *</label>
                <Input
                  name="eid"
                  value={formData.eid}
                  onChange={handleChange}
                  placeholder="EXXXXX"
                  required
                  pattern="^E\d{5}$"
                />
                <p className="text-xs text-gray-500">Format: EXXXXX (E followed by 5 digits)</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Designation *</label>
                <Input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Assistant Professor"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department *</label>
                <Select
                  name="department"
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept, idx) => (
                      <SelectItem key={idx} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number *</label>
                <Input
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  required
                  type="tel"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email ID *</label>
                <Input
                  name="email_id"
                  
                  placeholder="Enter your email address"
                  required
                  type="email"
                  
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gender *</label>
                <Select
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Joining *</label>
                <Input
                  name="date_of_joining"
                  value={formData.date_of_joining}
                  onChange={handleChange}
                  required
                  type="date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Highest Qualification *</label>
                <Input
                  name="highest_qualification"
                  value={formData.highest_qualification}
                  onChange={handleChange}
                  placeholder="e.g. Ph.D. in Computer Science"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Skills (Optional)</label>
                <Input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Enter skills separated by commas (e.g. Programming, Teaching, Research)"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-4"
              disabled={loading || uploadingProfilePic}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
