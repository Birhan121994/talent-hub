import Link from 'next/link';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import JobRecommendations from '@/components/JobRecommendations';
import api from '@/lib/axios';
import { 
  Briefcase, Users, TrendingUp, Award, 
  Search, MapPin, Clock, Shield, 
  Star, Rocket, Zap, Globe,
  ArrowRight, CheckCircle
} from 'lucide-react';
import axios from 'axios';

const getJobs = async () => {
  const res = await fetch('https://talent-hub-backend-k3f3.onrender.com/api/jobs/', {
    next: { revalidate: 60 }, // Optional caching
  });

  if (!res.ok) {
    console.error('Failed to fetch jobs:', res.statusText);
    return [];
  }

  const data = await res.json();

  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data.jobs)) {
    return data.jobs;
  } else {
    console.error('Unexpected data format:', data);
    return [];
  }
};


const StatsCard = ({ icon: Icon, number, label, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 card-hover">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{number}</h3>
    <p className="text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 card-hover">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

const TestimonialCard = ({ name, role, content, avatar }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
        {avatar}
      </div>
      <div className="ml-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{role}</p>
      </div>
    </div>
    <p className="text-gray-700 dark:text-gray-300">"{content}"</p>
    <div className="flex mt-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
      ))}
    </div>
  </div>
);

export default async function Home() {
  const jobs = await getJobs();
  const featuredJobs = Array.isArray(jobs) ? jobs.slice(0, 6) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      
      {/* Hero Section */}
      <section className="relative pt-40 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 py-20 overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent dark:from-blue-900/10 dark:to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                Find Your Dream <span className="text-primary dark:text-blue-400">Tech Job</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                Connect with top companies and discover opportunities that match your skills and aspirations. 
                TalentHub makes job hunting simple and effective.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/jobs" className="btn-primary inline-flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700">
                  Browse Jobs <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/register" className="border-2 border-primary text-primary dark:border-blue-400 dark:text-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white dark:hover:bg-blue-400 dark:hover:text-white transition-all duration-200 inline-flex items-center justify-center">
                  Get Started
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-6">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <Briefcase className="h-8 w-8 text-primary dark:text-blue-400 mr-4" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">10,000+ Jobs</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Active listings</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <Users className="h-8 w-8 text-secondary dark:text-green-400 mr-4" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">5,000+ Companies</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Hiring now</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                    <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-4" />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">95% Success Rate</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Job placements</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JobRecommendations />

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              icon={Briefcase} 
              number="10K+" 
              label="Active Jobs" 
              color="bg-blue-500" 
            />
            <StatsCard 
              icon={Users} 
              number="5K+" 
              label="Companies" 
              color="bg-green-500" 
            />
            <StatsCard 
              icon={TrendingUp} 
              number="95%" 
              label="Success Rate" 
              color="bg-purple-500" 
            />
            <StatsCard 
              icon={Award} 
              number="2K+" 
              label="Hires This Month" 
              color="bg-orange-500" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose TalentHub?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We're revolutionizing the job search experience with cutting-edge features 
              designed to connect talent with opportunity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Search}
              title="Smart Matching"
              description="Our AI-powered algorithm matches you with jobs that fit your skills and preferences perfectly."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={Shield}
              title="Verified Companies"
              description="All companies on our platform are thoroughly vetted to ensure legitimate opportunities."
              color="bg-green-500"
            />
            <FeatureCard
              icon={Zap}
              title="Quick Apply"
              description="Apply to multiple jobs with a single click using your TalentHub profile."
              color="bg-yellow-500"
            />
            <FeatureCard
              icon={Clock}
              title="Real-time Updates"
              description="Get instant notifications when employers view your application or schedule interviews."
              color="bg-purple-500"
            />
            <FeatureCard
              icon={Globe}
              title="Remote Opportunities"
              description="Discover thousands of remote and flexible work opportunities from around the world."
              color="bg-red-500"
            />
            <FeatureCard
              icon={Rocket}
              title="Career Growth"
              description="Access learning resources and career guidance to help you grow professionally."
              color="bg-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Jobs</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">Hand-picked opportunities from top companies</p>
            </div>
            <Link 
              href="/jobs" 
              className="text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold inline-flex items-center mt-4 lg:mt-0"
            >
              View All Jobs <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          
          {featuredJobs.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <Award className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No jobs available at the moment</h3>
              <p className="text-gray-500 dark:text-gray-400">Check back later for new opportunities!</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Don't just take our word for it - hear from developers and employers who have found success with TalentHub.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="Frontend Developer at TechCorp"
              content="TalentHub made my job search effortless. I found my dream job in just two weeks!"
              avatar="SJ"
            />
            <TestimonialCard
              name="Michael Chen"
              role="Hiring Manager at InnovateCo"
              content="The quality of candidates on TalentHub is exceptional. We've hired 5 developers through the platform."
              avatar="MC"
            />
            <TestimonialCard
              name="Emily Rodriguez"
              role="Full Stack Developer"
              content="The application process is so smooth. I love how I can track all my applications in one place."
              avatar="ER"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of developers and companies who are already finding success with TalentHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register?role=developer" 
              className="bg-white text-primary dark:bg-gray-100 dark:text-blue-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-all duration-200 inline-flex items-center justify-center"
            >
              Sign Up as Developer
            </Link>
            <Link 
              href="/register?role=employer" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-primary dark:hover:bg-gray-100 dark:hover:text-blue-700 transition-all duration-200 inline-flex items-center justify-center"
            >
              Sign Up as Employer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Briefcase className="h-6 w-6 mr-2" />
                TalentHub
              </h3>
              <p className="text-gray-400 mb-6">
                Connecting talent with opportunity. The modern job platform for developers and tech companies.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 极 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 极 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="极 0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5极14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.极-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Developers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Career Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resume Builder</a></li>
                <li><a href="#" className="hover:text极 transition-colors">Skill Assessment</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Post a Job</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browse Candidates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recruitment Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2024 TalentHub. All rights reserved. Built with passion for the developer community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}