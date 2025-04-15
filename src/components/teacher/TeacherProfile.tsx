import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, X, Upload, Image } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ResearcherIds } from "./ResearcherIds";

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

export const TeacherProfile = () => {
  const [teacherDetails, setTeacherDetails] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const profilePicRef = useRef<HTMLInputElement>(null);
  const timetableRef = useRef<HTMLInputElement>(null);
  
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
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (fileInput: HTMLInputElement, field: 'profile_pic_url' | 'timetable_url') => {
    const files = fileInput.files;
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${formData.eid}_${field === 'profile_pic_url' ? 'profile' : 'timetable'}_${Date.now()}.${fileExt}`;
    
    try {
      field === 'profile_pic_url' ? setUploadingProfilePic(true) : setUploadingTimetable(true);
      
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
        [field]: publicUrl
      }));
      
      toast.success(`${field === 'profile_pic_url' ? 'Profile picture' : 'Timetable'} uploaded successfully!`);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      field === 'profile_pic_url' ? setUploadingProfilePic(false) : setUploadingTimetable(false);
      fileInput.value = '';
    }
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
              {/* Hidden file inputs */}
              <input 
                type="file" 
                ref={profilePicRef} 
                className="hidden" 
                accept="image/*"
                onChange={() => handleFileUpload(profilePicRef.current!, 'profile_pic_url')}
              />
              <input 
                type="file" 
                ref={timetableRef} 
                className="hidden" 
                accept="image/*"
                onChange={() => handleFileUpload(timetableRef.current!, 'timetable_url')}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-medium">Profile Picture *</label>
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
                      size="sm"
                      onClick={() => profilePicRef.current?.click()}
                      disabled={uploadingProfilePic}
                    >
                      {uploadingProfilePic ? "Uploading..." : "Upload Profile Picture"}
                      <Upload className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-medium">Timetable Image (Optional)</label>
                  <div className="flex flex-col items-center gap-2">
                    {formData.timetable_url && (
                      <div className="relative w-full h-32 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={formData.timetable_url} 
                          alt="Timetable" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => timetableRef.current?.click()}
                      disabled={uploadingTimetable}
                    >
                      {uploadingTimetable ? "Uploading..." : "Upload Timetable"}
                      <Image className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
                
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
                  <Select
                    required
                    name="department"
                    value={formData.department}
                    onValueChange={(value) => handleSelectChange("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept, index) => (
                        <SelectItem key={index} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    required
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange('gender', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
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
                <Button type="submit" disabled={loading || uploadingProfilePic || uploadingTimetable}>
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
                    className="w-32 h-32 rounded-full mx-auto object-cover"
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

      {/* Add Researcher IDs section */}
      <ResearcherIds />

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
