import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../store/UserContext'


function Navbar({ onMenuToggle, isMobileMenuOpen }) {
  const navigate=useNavigate()
  const { currentUser, logout, isAuthenticated } = useUser()

  const handleLogout = () => {
    logout()
    navigate('/login') // Redirect to login after logout
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-[#78B9B5] z-50 h-14">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Logo and Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button - Only show when authenticated */}
          {isAuthenticated && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-[#065084] hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#78B9B5]"
              aria-label="Toggle menu"
            >
              <svg
                className={`h-6 w-6 transform transition-transform duration-200 ${
                  isMobileMenuOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-[#0F828C] rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-[#065084] hidden sm:block">
              BustyRide
            </span>
          </Link>
        </div>

        {/* Right side - User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* User Avatar - Hidden on small screens */}
              <div className="hidden sm:flex items-center space-x-2">
                <div className="h-8 w-8 bg-[#320A6B] rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {currentUser?.name?.charAt(0).toUpperCase() || 
                     currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-[#065084]">
                  {currentUser?.name || currentUser?.username}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-[#065084] hover:text-[#320A6B] hover:bg-[#f8fafc] rounded-md transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm font-medium text-[#065084] hover:text-[#320A6B] rounded-md transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-3 py-1.5 text-sm font-medium text-white bg-[#0F828C] hover:bg-[#065084] rounded-md transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar