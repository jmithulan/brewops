import React from 'react';
import { Mail, Phone, MapPin, Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white rounded-full"></div>
      </div>
      
      <div className="relative z-10 px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Company Info Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <Leaf className="w-8 h-8 mr-3 text-green-300" />
              <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Maleesha Tea Factory
              </h3>
            </div>
            
            <p className="text-green-100 mb-8 text-lg leading-relaxed">
              Crafting premium Ceylon tea with passion and tradition since generations. 
              Experience the authentic taste of Sri Lankan highlands in every cup.
            </p>
            
            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3 group">
                <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-500 transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-200">Email</p>
                  <p className="text-sm text-green-100 hover:text-white transition-colors cursor-pointer">
                    brewopsTea@gmail.com
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-500 transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-200">Phone</p>
                  <p className="text-sm text-green-100 hover:text-white transition-colors cursor-pointer">
                    +94 711 738 453
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-500 transition-colors duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-green-200">Location</p>
                  <p className="text-sm text-green-100 leading-relaxed">
                    Omattha Road, Agalawattha<br />
                    Mathugama, Sri Lanka
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Brand Section */}
          <div className="flex flex-col justify-center items-center lg:items-end text-center lg:text-right">
            <div className="bg-green-200 bg-opacity-25 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-40 shadow-lg">
              <div className="flex items-center justify-center lg:justify-end mb-4">
                <Leaf className="w-6 h-6 mr-2 text-green-600" />
                <h1 className="text-4xl font-bold text-gray-800">
                  BrewOps
                </h1>
              </div>
              <p className="text-gray-700 text-sm font-semibold tracking-wide">
                PREMIUM CEYLON TEA
              </p>
              <div className="mt-4 flex justify-center lg:justify-end space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-green-700 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Border */}
        <div className="mt-12 pt-8 border-t border-green-600 flex flex-col md:flex-row justify-between items-center">
          <p className="text-green-200 text-sm mb-4 md:mb-0">
            © 2025 Maleesha Tea Factory. Proudly brewing excellence.
          </p>
          <div className="flex space-x-6 text-sm text-green-200">
            <span className="hover:text-white transition-colors cursor-pointer">Quality</span>
            <span className="hover:text-white transition-colors cursor-pointer">Tradition</span>
            <span className="hover:text-white transition-colors cursor-pointer">Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;