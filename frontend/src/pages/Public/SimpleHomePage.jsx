import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ChevronRight } from 'lucide-react';

const SimpleHomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            BrewOps
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'About', 'Products', 'Contact'].map((item) => (
              <button 
                key={item}
                className="relative group text-gray-600 hover:text-gray-900 transition-all duration-300 font-medium"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
            <Link
              to="/login"
              className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 hover:shadow-lg transition-all duration-300 font-medium ml-4"
            >
              Log In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-gray-800 via-green-600 to-emerald-500 bg-clip-text text-transparent">
                  Welcome to BrewOps
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Premium tea management system for tea factories and suppliers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/login"
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/tea-field.jpg" 
                  alt="Tea Field"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Our Features
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Managing your tea factory operations has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "Inventory Management",
                description: "Track and manage your tea inventory with ease"
              },
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "Supplier Coordination",
                description: "Seamless communication with tea leaf suppliers"
              },
              {
                icon: <Leaf className="w-8 h-8" />,
                title: "Production Tracking",
                description: "Monitor production metrics and quality control"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-green-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">BrewOps</h3>
              <p className="text-gray-400">
                Premium tea management system for modern tea factories.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <p className="text-gray-400">
                info@brewops.com<br />
                +94 123 456 789
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 BrewOps. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleHomePage;