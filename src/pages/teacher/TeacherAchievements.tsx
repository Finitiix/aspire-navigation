
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AchievementForm } from "@/components/teacher/AchievementForm";
import { supabase } from "@/integrations/supabase/client";
import { Award, FileText, Clock, CalendarDays, ExternalLink, BadgeCheck, BadgeX } from "lucide-react";
import { format } from "date-fns";
import { AchievementStats } from "@/components/teacher/AchievementStats";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/components/ui/use-toast";

type Achievement = {
  id: string;
  title: string;
  category: string;
  date_achieved: string;
  status: string;
  created_at: string;
};

type AchievementCategory = Database["public"]["Enums"]["achievement_category"];

const TeacherAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | AchievementCategory>("all");
  const [tab, setTab] = useState("pending");

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let query = supabase
          .from("detailed_achievements")
          .select("*")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("category", filter);
        }

        if (tab !== "all") {
          query = query.eq("status", tab);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching achievements:", error);
          toast({
            title: "Error",
            description: "Could not fetch achievements. Please try again.",
            variant: "destructive",
          });
        } else {
          setAchievements(data || []);
        }
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast({
        title: "Error",
        description: "Could not fetch achievements. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filter, tab]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <BadgeCheck className="w-4 h-4 text-green-600" />;
      case "Rejected":
        return <BadgeX className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Achievements</h1>
      
      {/* Achievement Statistics */}
      <AchievementStats />
      
      <div className="flex justify-end mb-6">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#ea384c] hover:bg-red-700">
              <Award className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Achievement</DialogTitle>
            </DialogHeader>
            <AchievementForm onSuccess={() => {
              setIsFormOpen(false);
              fetchAchievements();
              toast({
                title: "Success",
                description: "Achievement added successfully!",
                variant: "success",
              });
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <label htmlFor="filter" className="block text-sm font-medium text-gray-700">
          Filter by Category:
        </label>
        <select
          id="filter"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | AchievementCategory)}
        >
          <option value="all">All Categories</option>
          <option value="Journal Articles">Journal Articles</option>
          <option value="Conference Papers">Conference Papers</option>
          <option value="Books & Book Chapters">Books & Book Chapters</option>
          <option value="Patents">Patents</option>
          <option value="Research Collaborations">Research Collaborations</option>
          <option value="Awards & Recognitions">Awards & Recognitions</option>
          <option value="Consultancy & Funded Projects">Consultancy & Funded Projects</option>
          <option value="Startups & Centers of Excellence">Startups & Centers of Excellence</option>
          <option value="Others">Others</option>
        </select>
      </div>

      <div className="mb-4">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          <select
            id="tabs"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="relative z-0 rounded-lg shadow flex divide-x divide-gray-200" aria-label="Tabs">
            <button
              onClick={() => setTab("pending")}
              className={`group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 ${tab === "pending" ? 'ring-2 ring-indigo-500' : ''
                }`}
            >
              <span>Pending</span>
              <span className="absolute inset-0 pointer-events-none" aria-hidden="true"></span>
            </button>
            <button
              onClick={() => setTab("approved")}
              className={`group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 ${tab === "approved" ? 'ring-2 ring-indigo-500' : ''
                }`}
            >
              <span>Approved</span>
              <span className="absolute inset-0 pointer-events-none" aria-hidden="true"></span>
            </button>
            <button
              onClick={() => setTab("rejected")}
              className={`group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 ${tab === "rejected" ? 'ring-2 ring-indigo-500' : ''
                }`}
            >
              <span>Rejected</span>
              <span className="absolute inset-0 pointer-events-none" aria-hidden="true"></span>
            </button>
            <button
              onClick={() => setTab("all")}
              className={`group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:z-10 ${tab === "all" ? 'ring-2 ring-indigo-500' : ''
                }`}
            >
              <span>All</span>
              <span className="absolute inset-0 pointer-events-none" aria-hidden="true"></span>
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="text-center">No achievements found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.category}</p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {format(new Date(achievement.date_achieved), "PPP")}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(achievement.status)}`}>
                  {getStatusIcon(achievement.status)}
                  <span className="ml-1">{achievement.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherAchievements;
