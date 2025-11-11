
import { Navigation } from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="container mx-auto text-center">
          <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            At Achievement Hub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
          </p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12 px-6 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <p className="text-gray-600">
              <strong>Last Updated:</strong> June 1, 2023
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600">
              We collect information that you provide directly to us when using our platform, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Personal information such as name, email address, and profile details</li>
              <li>Account credentials</li>
              <li>Educational data including course progress, achievements, and performance metrics</li>
              <li>Feedback and survey responses</li>
              <li>Communication preferences</li>
            </ul>
            <p className="text-gray-600">
              We may also collect information automatically when you visit our platform, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Log data and device information</li>
              <li>Usage patterns and interactions with our platform</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Providing, maintaining, and improving our educational services</li>
              <li>Creating and managing your account</li>
              <li>Tracking educational progress and achievements</li>
              <li>Personalizing your learning experience</li>
              <li>Communicating with you about our services, updates, and educational resources</li>
              <li>Analyzing usage patterns to enhance our platform</li>
              <li>Ensuring the security and integrity of our services</li>
            </ul>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">3. Sharing Your Information</h2>
            <p className="text-gray-600">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Educational institutions and teachers as appropriate for educational purposes</li>
              <li>Service providers who perform services on our behalf</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
            <p className="text-gray-600">
              We will not sell your personal information to third parties.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
              accidental loss, alteration, disclosure, or destruction. While we strive to protect your information, no method of transmission 
              over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Rights and Choices</h2>
            <p className="text-gray-600">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Accessing, correcting, or deleting your information</li>
              <li>Opting out of marketing communications</li>
              <li>Setting cookie preferences</li>
              <li>Data portability</li>
              <li>Withdrawing consent for certain processing activities</li>
            </ul>
            <p className="text-gray-600">
              To exercise these rights, please contact us using the information provided at the end of this policy.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">6. Children's Privacy</h2>
            <p className="text-gray-600">
              Our services are designed for use by educational institutions, teachers, and students of all ages. 
              We collect and process children's data in compliance with applicable laws, including the Children's Online Privacy 
              Protection Act (COPPA) in the United States. We obtain appropriate consent from parents or educational institutions 
              before collecting personal information from children under 13.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">7. International Data Transfers</h2>
            <p className="text-gray-600">
              Your information may be transferred to, stored, and processed in countries other than the one in which you reside. 
              We ensure appropriate safeguards are in place to protect your information when transferred internationally.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time to reflect changes to our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page 
              and updating the "Last Updated" date.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="text-gray-600">
              Email: privacy@achievementhub.com<br />
              Address: 123 Education Lane, Learning City, ED 12345, United States
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
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
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772a4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Achievement Hub. All rights reserved.</p>
            <p className="mt-2 text-sm">
              From{" "}
              <a 
                href="https://www.finitix.site/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-gray-300 hover:text-white transition-colors"
              >
                Finitix
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
