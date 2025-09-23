import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Leaf, Users, Award, ArrowDown, Play, Pause, Coffee, Heart, Star, Menu, X, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import OrderForm from '../../components/OrderForm';
import TourBookingForm from '../../components/TourBookingForm';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '24px'
};

const mapCenter = {
  lat: 6.555103856339234,
  lng: 80.18148954466014,
};

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showTourBookingForm, setShowTourBookingForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  
  // Section refs for smooth scrolling
  const aboutRef = useRef(null);
  const productsRef = useRef(null);
  const toursRef = useRef(null);
  const contactRef = useRef(null);

  const heroImages = [
    '/background.jpg',
    '/tea_1.jpg',
    '/tea.jpg',
    '/pic_01.jpg',
    '/pic_02.jpg',
  ];

  // Preload critical images
  useEffect(() => {
    const preloadImages = () => {
      heroImages.slice(0, 2).forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };
    preloadImages();
  }, []);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY);
  }, []);

  // Optimized mouse handler with throttling
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Parallax effect with throttled scroll
  useEffect(() => {
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  // Mouse tracking for interactive elements with throttling
  useEffect(() => {
    let ticking = false;
    const throttledMouseMove = (e) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleMouseMove(e);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, [handleMouseMove]);

  // Auto-slide with pause on hover
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Stats animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Optimized smooth scroll function with useCallback
  const scrollToSection = useCallback((sectionName) => {
    let targetRef;
    switch (sectionName.toLowerCase()) {
      case 'home':
        targetRef = heroRef;
        break;
      case 'about':
        targetRef = aboutRef;
        break;
      case 'products':
        targetRef = productsRef;
        break;
      case 'tours':
        targetRef = toursRef;
        break;
      case 'contact':
        targetRef = contactRef;
        break;
      default:
        return;
    }

    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, []);

  const stats = [
    { number: 50, suffix: '+', label: 'Years of Excellence' },
    { number: 1000, suffix: '+', label: 'Tea Pluckers Supported' },
    { number: 500, suffix: 'K+', label: 'Cups Served Daily' },
    { number: 25, suffix: '+', label: 'Countries Exported' }
  ];

  const features = [
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Sustainable Farming",
      description: "Eco-friendly practices that preserve our environment for future generations",
      color: "from-green-400 to-emerald-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Support",
      description: "Empowering local farmers with fair trade and sustainable livelihoods",
      color: "from-blue-400 to-cyan-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Award-winning Ceylon tea crafted with traditional methods and modern technology",
      color: "from-amber-400 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 text-gray-900 overflow-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Floating cursor effect */}
      <div 
        className="fixed w-6 h-6 bg-green-500 rounded-full pointer-events-none z-50 mix-blend-multiply transition-all duration-300 opacity-60"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: `scale(${mousePosition.x > 0 ? 1 : 0})`
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-white/30 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Maleesha Tea
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'About', 'Products', 'Tours', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item)}
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
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50">
            <div className="px-6 py-4 space-y-4">
              {['Home', 'About', 'Products', 'Tours', 'Contact'].map((item) => (
                <button 
                  key={item}
                  onClick={() => {
                    scrollToSection(item);
                    setIsMenuOpen(false);
                  }}
                  className="block text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 w-full text-left"
                >
                  {item}
                </button>
              ))}
              <Link
                to="/login"
                className="block bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors text-center font-medium mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Dynamic background */}
        <div className="absolute inset-0">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              }`}
              style={{ 
                backgroundImage: `url('${img}')`,
                transform: `translateY(${scrollY * 0.5}px) scale(${idx === currentSlide ? 1 : 1.1})`
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-green-50/80 to-emerald-100/90" />
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-20 text-center px-6 max-w-5xl">
          <div className="mb-6 overflow-hidden">
            <h1 className="text-6xl md:text-8xl font-black leading-tight animate-slide-up">
              <span className="bg-gradient-to-r from-gray-800 via-green-600 to-emerald-500 bg-clip-text text-transparent">
                CRAFT
              </span>
              <br />
              <span className="text-gray-800">
                THE FUTURE
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-delayed">
            Where ancient Ceylon tea traditions meet cutting-edge innovation. 
            Experience tea like never before.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delayed-2">
            <button 
              className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/30 hover:scale-105"
              onClick={() => scrollToSection('products')}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Journey
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
            
            <button 
              className="flex items-center gap-3 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full backdrop-blur-sm hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-all duration-300"
              onClick={() => setShowYoutubeModal(true)}
            >
              <Play className="w-5 h-5" />
              Watch Story
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-sm text-gray-600">Scroll to explore</span>
          <ArrowDown className="w-5 h-5 text-green-500" />
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-1 h-8 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-green-500 w-2' : 'bg-gray-400 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="py-20 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-4xl md:text-6xl font-black mb-2">
                  <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                    {statsVisible ? (
                      <CountUp end={stat.number} suffix={stat.suffix} />
                    ) : '0'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm md:text-base font-medium">{stat.label}</p>
                <div className="w-12 h-0.5 bg-gradient-to-r from-green-500 to-transparent mx-auto mt-2 transform scale-0 group-hover:scale-100 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        ref={aboutRef}
        className="py-20 px-6 bg-gradient-to-br from-gray-50 to-green-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                About
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Maleesha Tea
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              For over 50 years, Maleesha Tea Factory has been crafting the finest Ceylon tea, 
              combining traditional methods with modern innovation to bring you an exceptional tea experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Heritage</h3>
                <p className="text-gray-600 leading-relaxed">
                  Founded in 1970, Maleesha Tea Factory has been a cornerstone of Sri Lanka's tea industry. 
                  We've maintained the highest standards of quality while supporting local communities and 
                  preserving traditional tea-making techniques.
                </p>
              </div>
              
              <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To produce the world's finest Ceylon tea while promoting sustainable farming practices, 
                  supporting our local communities, and preserving the rich heritage of Sri Lankan tea culture.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-50 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/tea-factory.jpeg" 
                  alt="Maleesha Tea Factory"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Why Choose
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Maleesha
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of tradition, innovation and sustainability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 hover:border-green-300 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-green-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-emerald-50/0 group-hover:from-green-50/50 group-hover:to-emerald-50/30 rounded-3xl transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section 
        ref={productsRef}
        className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Our Premium
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Tea Collection
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated selection of premium Ceylon teas, each with its own unique character and flavor profile.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ceylon Black Tea",
                description: "Classic full-bodied black tea with rich, malty flavor and bright coppery color.",
                image: "/tea_1.jpg",
                price: "From $12.99",
                features: ["Full-bodied", "Malty", "Bright"]
              },
              {
                name: "Green Tea",
                description: "Delicate and refreshing green tea with subtle grassy notes and light aroma.",
                image: "/tea.jpg",
                price: "From $15.99",
                features: ["Delicate", "Refreshing", "Grassy"]
              },
              {
                name: "White Tea",
                description: "Rare and elegant white tea with subtle sweetness and delicate floral notes.",
                image: "/pic_01.jpg",
                price: "From $24.99",
                features: ["Elegant", "Sweet", "Floral"]
              }
            ].map((product, idx) => (
              <div key={idx} className="group bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.map((feature, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">{product.price}</span>
                    <button 
                      className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                      onClick={() => {
                        setSelectedProduct({
                          id: `tea-${idx + 1}`,
                          name: product.name,
                          price: product.price.replace('From ', ''),
                          image: product.image
                        });
                        setShowOrderForm(true);
                      }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section 
        ref={toursRef}
        className="py-20 px-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
              <span className="bg-gradient-to-r from-green-100 to-white bg-clip-text text-transparent">
                Tea Factory
              </span>
              <br />
              <span className="text-white">
                Tours
              </span>
            </h2>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              Experience the magic of tea production firsthand with our guided factory tours and tastings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Factory Tour",
                duration: "2 hours",
                price: "$25",
                description: "Complete guided tour of our tea processing facility with expert commentary.",
                features: ["Factory walkthrough", "Tea tasting", "Expert guide"]
              },
              {
                title: "Tea Garden Tour",
                duration: "3 hours",
                price: "$35",
                description: "Explore our tea gardens and learn about sustainable farming practices.",
                features: ["Garden walk", "Plucking demo", "Sustainability talk"]
              },
              {
                title: "Premium Experience",
                duration: "4 hours",
                price: "$50",
                description: "Complete experience including factory, gardens, and premium tasting session.",
                features: ["Full tour", "Premium tasting", "Lunch included"]
              }
            ].map((tour, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <h3 className="text-2xl font-bold mb-2 text-white">{tour.title}</h3>
                <p className="text-green-100 mb-4">{tour.description}</p>
                <div className="space-y-2 mb-6">
                  {tour.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-green-100">
                      <div className="w-2 h-2 bg-green-300 rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-white">{tour.price}</span>
                  <span className="text-green-100">{tour.duration}</span>
                </div>
                <button 
                  className="w-full px-6 py-3 bg-white text-green-600 font-bold rounded-full hover:bg-green-50 transition-colors"
                  onClick={() => {
                    setSelectedTour({
                      id: `tour-${idx + 1}`,
                      title: tour.title,
                      price: tour.price,
                      duration: tour.duration
                    });
                    setShowTourBookingForm(true);
                  }}
                >
                  Book Tour
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Map Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Visit Our
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Tea Factory
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Located in the heart of Sri Lanka's tea country, experience our heritage firsthand
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Map Container */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 group hover:shadow-3xl transition-all duration-500">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-50 relative overflow-hidden">
                  {/* Map placeholder instead of Google Maps */}
                  <div className="flex items-center justify-center w-full h-full bg-gray-100">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-sm" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Maleesha Tea Factory</h3>
                      <p className="text-gray-600 mt-2">Omaththa Road, Agalawatta, Mathugama, Sri Lanka</p>
                    </div>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700">Live</span>
                  </div>
                </div>
                
                {/* Map Controls */}
                <div className="p-6 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800">Maleesha Tea Factory</h4>
                    <button className="text-green-600 hover:text-green-700 font-medium transition-colors">
                      Get Directions
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">Maleesha Tea Factory, Omaththa Road, Agalawatta, Mathugama</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all duration-300 text-sm font-medium">
                      Satellite View
                    </button>
                    <button className="px-4 py-2 bg-gray-100 hover:bg-green-50 hover:text-green-600 rounded-lg transition-all duration-300 text-sm font-medium">
                      Street View
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded-sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Factory Address</h4>
                      <p className="text-gray-600">Maleesha Tea Factory, Omaththa Road, Agalawatta, Mathugama, Sri Lanka</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Operating Hours</h4>
                      <p className="text-gray-600">Monday - Saturday: 8:00 AM - 5:00 PM</p>
                      <p className="text-gray-600">Sunday: 9:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-amber-500 rounded-sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Contact Info</h4>
                      <p className="text-gray-600">+94 XX XXX XXXX</p>
                      <p className="text-gray-600">info@brewopstea.lk</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 hover:scale-[1.02] shadow-lg"
                  onClick={() => {
                    setSelectedTour({
                      id: 'factory-tour',
                      title: 'Factory Tour',
                      price: '$25',
                      duration: '2 hours'
                    });
                    setShowTourBookingForm(true);
                  }}
                >
                  Schedule Factory Tour
                </button>
                <button className="w-full px-6 py-4 border-2 border-green-500 text-green-600 font-bold rounded-2xl hover:bg-green-50 transition-all duration-300">
                  Download Location Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-black mb-6 text-white">
            Ready to Experience
            <br />
            <span className="bg-gradient-to-r from-green-100 to-white bg-clip-text text-transparent">
              Premium Ceylon Tea?
            </span>
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of tea lovers who have discovered the perfect cup
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="px-8 py-4 bg-white text-green-700 font-bold rounded-full hover:bg-green-50 transition-all duration-300 hover:scale-105 shadow-xl"
              onClick={() => {
                setSelectedProduct({
                  id: 'premium-tea-collection',
                  name: 'Premium Tea Collection',
                  price: '$19.99',
                  image: '/tea_1.jpg'
                });
                setShowOrderForm(true);
              }}
            >
              Order Now
            </button>
            <button 
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-green-700 transition-all duration-300"
              onClick={() => {
                setSelectedTour({
                  id: 'premium-tour-experience',
                  title: 'Premium Experience Tour',
                  price: '$50',
                  duration: '4 hours'
                });
                setShowTourBookingForm(true);
              }}
            >
              Schedule Tour
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        ref={contactRef}
        className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Get In
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Touch
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about our teas or want to schedule a visit? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tea inquiry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tell us about your tea preferences..."
                  />
                </div>
                <button className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded-sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Address</h4>
                      <p className="text-gray-600">Maleesha Tea Factory<br />Omaththa Road, Agalawatta<br />Mathugama, Sri Lanka</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-500 rounded-sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Phone</h4>
                      <p className="text-gray-600">+94 XX XXX XXXX</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-amber-500 rounded-sm" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 mb-1">Email</h4>
                      <p className="text-gray-600">info@brewopstea.lk</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">8:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <h3 className="text-3xl font-black mb-4 bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Maleesha Tea Factory
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Crafting premium Ceylon tea with passion, tradition and innovation since 2000.
              </p>
              <div className="flex gap-4">
                {[
                  { name: 'facebook', icon: Facebook, url: 'https://facebook.com' },
                  { name: 'instagram', icon: Instagram, url: 'https://instagram.com' },
                  { name: 'twitter', icon: Twitter, url: 'https://twitter.com' },
                  { name: 'linkedin', icon: Linkedin, url: 'https://linkedin.com' }
                ].map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-green-500 hover:text-white transition-all duration-300 cursor-pointer group hover:scale-110 hover:shadow-lg"
                    >
                      <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-gray-800">Quick Links</h4>
              {['About Us', 'Products', 'Tea Tours', 'Sustainability'].map((link) => (
                <a key={link} href="#" className="block text-gray-600 hover:text-green-500 mb-2 transition-colors">
                  {link}
                </a>
              ))}
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-gray-800">Contact</h4>
              <p className="text-gray-600 text-sm mb-2">
                Maleesha Tea Factory, Omaththa Road, Agalawatta<br />
                Mathugama, Sri Lanka
              </p>
              <p className="text-gray-600 text-sm">
                +94 XX XXX XXXX
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Maleesha Tea Factory. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500" /> for tea lovers
            </p>
          </div>
        </div>
      </footer>

      {/* YouTube Video Modal */}
      {showYoutubeModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setShowYoutubeModal(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/uzMFi_7NSrs?autoplay=1"
                title="Tea Factory Story"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Form Modal */}
      {showOrderForm && selectedProduct && (
        <OrderForm 
          product={selectedProduct} 
          onClose={() => {
            setShowOrderForm(false);
            setSelectedProduct(null);
          }} 
        />
      )}
      
      {/* Tour Booking Form Modal */}
      {showTourBookingForm && selectedTour && (
        <TourBookingForm 
          tour={selectedTour} 
          onClose={() => {
            setShowTourBookingForm(false);
            setSelectedTour(null);
          }} 
        />
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes slide-up {
          0% { transform: translateY(100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fade-in-delayed {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        
        .animate-fade-in-delayed {
          animation: fade-in-delayed 1s cubic-bezier(0.23, 1, 0.32, 1) 0.3s both;
        }
        
        .animate-fade-in-delayed-2 {
          animation: fade-in-delayed 1s cubic-bezier(0.23, 1, 0.32, 1) 0.6s both;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out both;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

// Counter component for stats
const CountUp = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const increment = end / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end]);

  return <span>{count}{suffix}</span>;
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Homepage);
