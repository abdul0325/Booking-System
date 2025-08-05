import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useUser } from '../store/UserContext';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useUser();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS for professional animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .slide-in {
          animation: slideInLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .backdrop-blur-light {
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        
        .shadow-professional {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>

      {/* Fixed Navbar */}
      <Navbar 
        onMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      <div className="flex pt-14">
        {/* Desktop Sidebar - Fixed, only show when authenticated */}
        {isAuthenticated && (
          <div className="hidden lg:block fixed left-0 top-14 h-full z-30">
            <Sidebar onItemClick={closeMobileMenu} />
          </div>
        )}
        
        {/* Professional Mobile Sidebar */}
        {isMobileMenuOpen && isAuthenticated && (
          <>
            {/* Subtle Professional Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-light z-40 transition-all duration-300"
              onClick={closeMobileMenu}
            />
            
            {/* Professional Mobile Sidebar Panel */}
            <div 
              className={`lg:hidden fixed left-0 top-14 h-full z-50 transition-all duration-300 ease-out ${
                isMobileMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              }`}
            >
              <div className="bg-white shadow-professional border-r border-gray-200 h-full">
                <div className="w-72 sm:w-80">
                  <Sidebar onItemClick={closeMobileMenu} />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${
          isAuthenticated ? 'lg:ml-56' : ''
        }`}>
          <main className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Content Container */}
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;