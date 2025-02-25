
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface AuthPageProps {
  role: "teacher" | "admin";
}

export const AuthPage = ({ role }: AuthPageProps) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will implement Supabase auth here
    console.log("Auth submitted:", { username, password, role });
  };

  const validateTeacherUsername = (value: string) => {
    return /^E\d{5}$/.test(value);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 flex items-center justify-center bg-gray-50 animate-fadeIn">
      <Card className="w-full max-w-md mx-4 shadow-xl">
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
              />
              {role === "teacher" && username && !validateTeacherUsername(username) && (
                <p className="text-red-500 text-sm">Username must be in format EXXXXX (E followed by 5 digits)</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              {isSignIn ? "Sign In" : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsSignIn(!isSignIn)}
                className="ml-1 text-primary hover:underline"
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
