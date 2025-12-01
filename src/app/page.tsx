'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FiMessageCircle, FiUsers, FiZap, FiShield, FiSmartphone, FiGlobe } from 'react-icons/fi';

export default function Home() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: FiMessageCircle,
      title: 'Real-time Messaging',
      description: 'Instant message delivery with Socket.io for seamless conversations.',
    },
    {
      icon: FiUsers,
      title: 'User Discovery',
      description: 'Find and connect with other users easily through our discover feature.',
    },
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Optimized performance with Next.js 15 and modern web technologies.',
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'JWT authentication and encrypted connections keep your data safe.',
    },
    {
      icon: FiSmartphone,
      title: 'Mobile Friendly',
      description: 'Responsive design that works beautifully on all devices.',
    },
    {
      icon: FiGlobe,
      title: 'Always Connected',
      description: 'Stay connected with online status indicators and typing notifications.',
    },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F18805]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#F18805]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-[#F18805]/5 to-transparent rounded-full" />
      </div>

      {/* Navigation */}
      <nav className={`relative z-10 px-6 py-6 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-xl flex items-center justify-center">
              <FiMessageCircle className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-white">Soro</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#F18805]/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 sm:pt-24 pb-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Real-time messaging platform</span>
            </div>
          </div>
          
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-bold mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-white">Connect with</span>
            <br />
            <span className="bg-gradient-to-r from-[#F18805] via-[#FF9500] to-[#FFB347] bg-clip-text text-transparent">
              Anyone, Anywhere
            </span>
          </h1>
          
          <p className={`text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Experience seamless real-time communication with Soro. Built with modern technologies for speed, security, and an exceptional user experience.
          </p>
          
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link
              href="/register"
              className="group relative bg-gradient-to-r from-[#F18805] to-[#FF9500] text-black font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#F18805]/30 hover:scale-105"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Start Chatting</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/login"
              className="group flex items-center space-x-2 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-full border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:bg-gray-800/50"
            >
              <span>I have an account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to stay connected
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make communication effortless and enjoyable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl hover:border-[#F18805]/50 transition-all duration-500 hover:bg-gray-900/70 hover:-translate-y-1 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#F18805]/20 to-[#FF9500]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#F18805]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className={`bg-gradient-to-br from-gray-900 to-gray-900/50 border border-gray-800 rounded-3xl p-8 sm:p-12 text-center transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '900ms' }}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Built with Modern Technologies
            </h2>
            <p className="text-gray-400 mb-8">
              Leveraging the best tools in the industry for performance and reliability.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {['Next.js 15', 'React 19', 'TypeScript', 'Socket.io', 'MongoDB', 'Tailwind CSS', 'Express.js', 'Cloudinary'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-sm text-gray-300 hover:border-[#F18805]/50 hover:text-white transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 pb-32">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1000ms' }}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to start chatting?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Join Soro today and experience the future of real-time communication.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#F18805] to-[#FF9500] hover:from-[#FF9500] hover:to-[#F18805] text-black font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#F18805]/30 hover:scale-105"
          >
            <span>Create Free Account</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#F18805] to-[#FF9500] rounded-lg flex items-center justify-center">
              <FiMessageCircle className="w-4 h-4 text-black" />
            </div>
            <span className="text-lg font-semibold text-white">Soro</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Soro. Built with ❤️ for seamless communication.
          </p>
        </div>
      </footer>
    </div>
  );
}
