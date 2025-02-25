
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { X, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthPageProps {
  role: "teacher" | "admin";
}

export const AuthPage = ({ role }: AuthPageProps) => {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role === "teacher" && !validateTeacherUsername(username)) {
        toast.error("Invalid teacher ID format");
        setLoading(false);
        return;
      }

      const email = `${username.toLowerCase()}@achievementhub.com`;

      if (isSignIn) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) throw new Error("No user found");

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile || profile.role !== role) {
          await supabase.auth.signOut();
          throw new Error("Unauthorized access");
        }

        toast.success("Signed in successfully!");
        navigate(`/${role.toLowerCase()}-dashboard`);
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
            },
          },
        });

        if (signUpError) throw signUpError;
        toast.success("Account created! Please sign in.");
        setIsSignIn(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const validateTeacherUsername = (value: string): boolean => {
    return /^E\d{5}$/.test(value);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-xl relative">
        <button
          onClick={() => navigate("/")}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            {isSignIn ? "Sign In" : "Sign Up"} as {role.charAt(0).toUpperCase() + role.slice(1)}
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to {isSignIn ? "sign in" : "create an account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === "teacher" ? "EXXXXX" : "Username"}
                className="w-full"
                disabled={loading}
              />
              {role === "teacher" && username && !validateTeacherUsername(username) && (
                <p className="text-red-500 text-sm">Username must be in format EXXXXX (E followed by 5 digits)</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {isSignIn ? "Sign In" : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsSignIn(!isSignIn)}
                className="ml-1 text-primary hover:underline"
                disabled={loading}
              >
                {isSignIn ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
