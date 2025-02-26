
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const [feedback, setFeedback] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setFeedback(data);
    };

    fetchFeedback();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Feedback Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.subject}</h3>
                    <span className="text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">From: {item.name} ({item.identifier})</p>
                  <p className="mt-2">{item.message}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
