
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type Feedback = {
  id: string;
  name: string;
  identifier: string;
  subject: string;
  message: string;
  created_at: string;
};

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFeedbacks(data || []);
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async () => {
    if (!feedbackToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', feedbackToDelete);
      
      if (error) throw error;
      
      setFeedbacks(feedbacks.filter(feedback => feedback.id !== feedbackToDelete));
      toast.success("Feedback deleted successfully");
    } catch (error: any) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    } finally {
      setFeedbackToDelete(null);
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{feedback.subject}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <p><span className="font-medium">From:</span> {feedback.name}</p>
                          <p><span className="font-medium">ID:</span> {feedback.identifier}</p>
                          <p><span className="font-medium">Date:</span> {format(new Date(feedback.created_at), "PP")}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setFeedbackToDelete(feedback.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="whitespace-pre-wrap">{feedback.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No feedback submissions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!feedbackToDelete} onOpenChange={(open) => !open && setFeedbackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                deleteFeedback();
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminFeedback;
