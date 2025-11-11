
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trash } from "lucide-react";
import { toast } from "sonner";

type FeedbackItem = {
  id: string;
  name: string;
  identifier: string;
  subject: string;
  message: string;
  created_at: string;
}

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      if (data) setFeedback(data as FeedbackItem[]);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state to remove the deleted item
      setFeedback(feedback.filter(item => item.id !== id));
      toast.success('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <p>Loading feedback...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.length > 0 ? (
                feedback.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.subject}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">From: {item.name} ({item.identifier})</p>
                      <p className="mt-2 text-gray-800">{item.message}</p>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No feedback messages found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* From Finitix Branding */}
      <div className="text-center py-6 mt-8">
        <p className="text-sm text-gray-500">
          From{" "}
          <a 
            href="https://www.finitix.site/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Finitix
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminFeedback;
