
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, School, Shield, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const sections = [
    {
      title: "Student",
      icon: GraduationCap,
      description: "Access your courses, track progress, and achieve your goals",
      link: "/student"
    },
    {
      title: "Teacher",
      icon: School,
      description: "Manage your classes and monitor student performance",
      link: "/teacher"
    },
    {
      title: "Admin",
      icon: Shield,
      description: "Oversee system operations and user management",
      link: "/admin"
    },
    {
      title: "Feedback",
      icon: MessageSquare,
      description: "Share your thoughts and help us improve",
      link: "/feedback"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Achievement Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering education through technology. Connect, learn, and achieve excellence together.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section, index) => (
              <Link 
                key={section.title} 
                to={section.link}
                className="transform transition-all duration-300 hover:-translate-y-2"
              >
                <Card className="h-full shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-2">
                    <section.icon className="w-12 h-12 mx-auto text-primary mb-4" />
                    <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">{section.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-400">
                Achievement Hub is dedicated to transforming education through innovative technology solutions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">Email: info@achievementhub.com</p>
              <p className="text-gray-400">Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Achievement Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
