import React, { useState, useEffect } from 'react'
import { useUser } from '../store/UserContext'
import { useBooking } from '../store/BookingContext'

function ShowBooking() {
  const { currentUser, isAdmin, isStationMaster } = useUser()
  const { userBookings, stations, loading, fetchUserBookings, error } = useBooking(); // Added stations from context
  const [filter, setFilter] = useState('all') // all, confirmed, cancelled
  const [selectedStation, setSelectedStation] = useState('')

  // Safe fallback for bookings - ensure it's always an array
  const bookings = userBookings || []

  useEffect(() => {
    if (currentUser?.token) {
      if (isAdmin()) {
        // fetchAllBookings(); // This function doesn't exist in your BookingContext
        fetchUserBookings(); // Using available function for now
      } else {
        fetchUserBookings();
      }
    }
    // eslint-disable-next-line
  }, [currentUser, filter, selectedStation]);

  // Helper function to get station name from station ID
  const getStationName = (stationId) => {
    const station = stations.find(s => s.stationId === stationId || s._id === stationId)
    if (station) {
      return `${station.city} - ${station.stationName}`
    }
    return stationId // fallback to showing the ID if station not found
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getTravelTypeBadge = (type) => {
    const typeConfig = {
      business: { color: 'bg-blue-100 text-blue-800', text: 'Business' },
      economy: { color: 'bg-gray-100 text-gray-800', text: 'Economy' }
    }
    
    const config = typeConfig[type] || typeConfig.economy
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Filter bookings based on selected filter and station
  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (filter !== 'all' && booking.status !== filter) {
      return false
    }
    
    // Filter by station (check both from and to stations)
    if (selectedStation && selectedStation !== '') {
      const matchesFromStation = booking.fromStation === selectedStation
      const matchesToStation = booking.toStation === selectedStation
      if (!matchesFromStation && !matchesToStation) {
        return false
      }
    }
    
    return true
  })

  // Get all available stations from stations context instead of just from bookings
  const getAllStations = () => {
    // Return all stations from the stations context
    return stations || []
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchUserBookings()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin() ? 'All Bookings' : isStationMaster() ? 'Station Bookings' : 'My Bookings'}
          </h1>
          <p className="text-gray-600">
            {isAdmin() 
              ? 'Manage all bookings across all stations' 
              : isStationMaster() 
              ? 'View bookings for your station'
              : 'View your booking history and current reservations'
            }
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {(isAdmin() || isStationMaster()) && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Station</label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Stations</option>
                  {getAllStations().map(station => (
                    <option key={station._id || station.stationId} value={station._id || station.stationId}>
                      {station.city} - {station.stationName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== 'all' || selectedStation 
                ? 'No bookings match your current filters.'
                : isAdmin() || isStationMaster() 
                  ? 'No bookings available.'
                  : 'You haven\'t made any bookings yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id || booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Booking Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Booking #{booking._id?.slice(-6) || booking.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Booked on {formatDate(booking.createdAt || booking.bookingDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                      {getStatusBadge(booking.status)}
                      {getTravelTypeBadge(booking.travelType)}
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Route Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            <strong>From:</strong> {getStationName(booking.fromStation)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            <strong>To:</strong> {getStationName(booking.toStation)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            <strong>Date:</strong> {formatDate(booking.date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            <strong>Time:</strong> {formatTime(booking.time)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Booking Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Passenger:</span>
                          <span className="text-sm font-medium text-gray-900">{booking.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Seats:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {(booking.seats || []).map(seat => seat.number).join(', ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Amount:</span>
                          <span className="text-sm font-bold text-green-600">
                            PKR {(booking.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Travel Class:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {booking.travelType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat Visualization */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Seats</h4>
                    <div className="grid grid-cols-8 gap-2">
                      {Array.from({ length: 40 }, (_, i) => {
                        const seatNumber = i + 1
                        const isBooked = (booking.seats || []).some(seat => seat.number === seatNumber)
                        return (
                          <div
                            key={seatNumber}
                            className={`w-8 h-8 rounded text-xs font-medium flex items-center justify-center ${
                              isBooked
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {seatNumber}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShowBooking