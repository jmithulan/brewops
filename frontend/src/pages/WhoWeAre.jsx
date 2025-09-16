import React from 'react';

const WhoWeAre = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">About Our Tea Factory</h1>
          
          <div className="prose max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Story</h2>
                <p className="text-gray-600 leading-relaxed">
                  Founded in 1985, our tea factory has been producing premium quality tea for over three decades. 
                  We are committed to sustainable farming practices and maintaining the highest standards of quality 
                  in every cup of tea we produce.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
                <p className="text-gray-600 leading-relaxed">
                  To provide the finest quality tea products while supporting local communities and maintaining 
                  environmental sustainability. We believe in fair trade practices and ensuring our suppliers 
                  receive fair compensation for their hard work.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Sustainability</h3>
                  <p className="text-gray-600 text-sm">Eco-friendly farming and production methods</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Quality</h3>
                  <p className="text-gray-600 text-sm">Premium quality in every product</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Community</h3>
                  <p className="text-gray-600 text-sm">Supporting local farmers and communities</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Address</h3>
                  <p className="text-gray-600">123 Tea Garden Road<br />Colombo, Sri Lanka 10000</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Contact</h3>
                  <p className="text-gray-600">Phone: +94 11 234 5678<br />Email: info@teafactory.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoWeAre;




