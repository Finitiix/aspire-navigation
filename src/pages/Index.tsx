
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, School, Shield, MessageSquare, Award, Trophy, Users, BookOpen, Target, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Student",
      icon: GraduationCap,
      description: "Access your courses, track progress, and achieve your goals",
      onClick: () => window.location.href = "https://cec-aiml.vercel.app/"
    },
    {
      title: "Teacher",
      icon: School,
      description: "Manage your classes and monitor student performance",
      onClick: () => navigate("/teacher")
    },
    {
      title: "Admin",
      icon: Shield,
      description: "Oversee system operations and user management",
      onClick: () => navigate("/admin-auth")
    },
    {
      title: "Feedback",
      icon: MessageSquare,
      description: "Share your thoughts and help us improve",
      onClick: () => navigate("/feedback")
    }
  ];

  const testimonials = [
    {
      quote: "Achievement Hub has transformed how I organize my classroom and track student progress.",
      author: "Sarah Johnson",
      role: "Science Teacher"
    },
    {
      quote: "The detailed analytics provided by Achievement Hub have helped me identify areas where my students need additional support.",
      author: "Michael Chen",
      role: "Mathematics Instructor"
    },
    {
      quote: "The platform's intuitive interface makes it easy for my students to access their assignments and track their progress.",
      author: "Priya Patel",
      role: "English Teacher"
    }
  ];

  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "Active Users"
    },
    {
      icon: BookOpen,
      number: "5,000+",
      label: "Courses Available"
    },
    {
      icon: Trophy,
      number: "50,000+",
      label: "Achievements Awarded"
    },
    {
      icon: Target,
      number: "98%",
      label: "Satisfaction Rate"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 bg-gradient-to-r from-red-50 via-white to-red-50">
        <div className="container mx-auto text-center">
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-10">
            <img 
              src="/lovable-uploads/ed572269-6672-4d2b-b720-374756490a00.png" 
              alt="Trophy Background" 
              className="w-96 h-96" 
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 relative z-10">
            Welcome to <span className="text-primary">Achievement Hub</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Empowering education through technology. Connect, learn, and achieve excellence together.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8"
              onClick={() => navigate("/teacher")}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate("/about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sections.map((section) => (
              <div
                key={section.title}
                onClick={section.onClick}
                className="group transform transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
                <Card className="h-[300px] shadow-lg hover:shadow-xl transition-shadow transition-colors duration-300 group-hover:bg-red-500">
                  <CardHeader className="text-center pb-2">
                    <section.icon className="w-16 h-16 mx-auto text-primary mb-4 transition-colors duration-300 group-hover:text-white" />
                    <CardTitle className="text-2xl font-bold transition-colors duration-300 group-hover:text-white">
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center text-lg transition-colors duration-300 group-hover:text-white">
                      {section.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
                <stat.icon className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-4xl font-bold mb-2">{stat.number}</h3>
                <p className="text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4 text-primary">
                    <Star className="w-8 h-8 inline-block" />
                    <Star className="w-8 h-8 inline-block" />
                    <Star className="w-8 h-8 inline-block" />
                    <Star className="w-8 h-8 inline-block" />
                    <Star className="w-8 h-8 inline-block" />
                  </div>
                  <p className="italic text-gray-600 mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Achievement Hub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Comprehensive Learning</h3>
              <p className="text-gray-600">Access a wide range of educational resources and tools designed to enhance learning outcomes.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Real-time Progress</h3>
              <p className="text-gray-600">Track and monitor student progress with detailed analytics and reporting tools.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Collaborative Environment</h3>
              <p className="text-gray-600">Foster communication between students, teachers, and administrators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Educational Experience?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of teachers and students who are already benefiting from Achievement Hub.</p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 font-semibold px-8"
            onClick={() => navigate("/teacher")}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">About Achievement Hub</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-600 mb-6">
              Achievement Hub is a leading educational technology platform dedicated to transforming the learning experience. 
              Our mission is to provide innovative tools and resources that empower students, teachers, and administrators 
              to achieve their educational goals.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              With our comprehensive suite of features and user-friendly interface, we make it easier than ever to 
              manage educational processes, track progress, and foster collaboration within the academic community.
            </p>
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate("/about")}
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <img 
                  src="/lovable-uploads/ed572269-6672-4d2b-b720-374756490a00.png" 
                  alt="Trophy" 
                  className="w-8 h-8" 
                />
                <span className="text-xl font-bold">Achievement Hub</span>
              </Link>
              <p className="text-gray-400">
                Empowering education through innovative technology solutions.
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
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 mb-2">Email: info@achievementhub.com</p>
              <p className="text-gray-400 mb-2">Phone: (555) 123-4567</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
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
