
import { Navigation } from "@/components/Navigation";
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
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Achievement Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering education through technology. Connect, learn, and achieve excellence together.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-6 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section) => (
              <Link 
                key={section.title} 
                to={section.link}
                className="transform transition-all duration-300 hover:-translate-y-2"
              >
                <Card className="h-[300px] shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-2">
                    <section.icon className="w-16 h-16 mx-auto text-primary mb-4" />
                    <CardTitle className="text-2xl font-bold">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center text-lg">{section.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Achievement Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Comprehensive Learning</h3>
              <p className="text-gray-600">Access a wide range of educational resources and tools designed to enhance learning outcomes.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Real-time Progress</h3>
              <p className="text-gray-600">Track and monitor student progress with detailed analytics and reporting tools.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Collaborative Environment</h3>
              <p className="text-gray-600">Foster communication between students, teachers, and administrators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">About Achievement Hub</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-6">
              Achievement Hub is a leading educational technology platform dedicated to transforming the learning experience. 
              Our mission is to provide innovative tools and resources that empower students, teachers, and administrators 
              to achieve their educational goals.
            </p>
            <p className="text-lg text-gray-600">
              With our comprehensive suite of features and user-friendly interface, we make it easier than ever to 
              manage educational processes, track progress, and foster collaboration within the academic community.
            </p>
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
