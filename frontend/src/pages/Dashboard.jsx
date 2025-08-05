import React, { useState, useEffect } from 'react'
import { useUser } from '../store/UserContext'
import { useBooking } from '../store/BookingContext'
import { fetchStations, createStation } from '../services/StationServices'

function Dashboard() {
  const { currentUser, isAdmin, isStationMaster, getAllUsers } = useUser()
  const { refreshStations, fetchAllBookings, userBookings } = useBooking()

  const [stations, setStations] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [showAddStationModal, setShowAddStationModal] = useState(false)
  const [newStation, setNewStation] = useState({
    city: '',
    stationName: '',
    stationId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Get station-specific data for station masters
  const stationId = currentUser?.assignedStation?.stationId
  const stationName = currentUser?.assignedStation?.stationName

  // Filter bookings based on user role
  const getFilteredBookings = (bookings) => {
    if (!bookings) return []
    
    if (isAdmin()) {
      return bookings // Admin sees all bookings
    } else if (isStationMaster() && stationId) {
      // Station master only sees bookings from their assigned station
      return bookings.filter(booking => booking.fromStation === stationId)
    }
    
    return []
  }

  // Fetch data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load stations
      await loadStations()
      
      // Load bookings if user has admin or station master privileges
      if (isAdmin() || isStationMaster()) {
        await loadAllBookings()
      }
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadStations = async () => {
    try {
      const data = await fetchStations()
      setStations(data)
    } catch (err) {
      console.error('Error loading stations:', err)
    }
  }

  const loadAllBookings = async () => {
    try {
      if (fetchAllBookings) {
        await fetchAllBookings()
        // Filter bookings based on user role
        const filteredBookings = getFilteredBookings(userBookings)
        setAllBookings(filteredBookings)
      }
    } catch (err) {
      console.error('Error loading bookings:', err)
    }
  }

  // Update allBookings when userBookings changes
  useEffect(() => {
    if (userBookings) {
      const filteredBookings = getFilteredBookings(userBookings)
      setAllBookings(filteredBookings)
    }
  }, [userBookings, stationId]) // Added stationId as dependency

  const handleAddStation = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      if (!newStation.city || !newStation.stationName || !newStation.stationId) {
        setError('Please fill in all fields')
        return
      }
      
      // Check if station ID already exists
      const existingStation = stations.find(s => s.stationId === newStation.stationId)
      if (existingStation) {
        setError('Station ID already exists')
        return
      }
      
      const token = localStorage.getItem('busBookingToken')
      await createStation(newStation, token)
      
      setSuccess('Station added successfully!')
      setNewStation({ city: '', stationName: '', stationId: '' })
      setShowAddStationModal(false)
      
      // Refresh stations
      await loadStations()
      if (refreshStations) {
        await refreshStations()
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add station. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowAddStationModal(false)
    setNewStation({ city: '', stationName: '', stationId: '' })
    setError('')
    setSuccess('')
  }

  // Calculate statistics (now using filtered bookings)
  const totalBookings = allBookings.length
  const confirmedBookings = allBookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = allBookings.filter(b => b.status === 'pending').length
  const cancelledBookings = allBookings.filter(b => b.status === 'cancelled').length
  const totalRevenue = allBookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  const totalStations = stations.length

  // Recent bookings (last 5)
  const recentBookings = allBookings
    .sort((a, b) => new Date(b.bookingDate || b.createdAt) - new Date(a.bookingDate || a.createdAt))
    .slice(0, 5)

  // Popular routes (based on filtered bookings)
  const routeStats = allBookings.reduce((acc, booking) => {
    const route = `${booking.fromStation} → ${booking.toStation}`
    acc[route] = (acc[route] || 0) + 1
    return acc
  }, {})

  const popularRoutes = Object.entries(routeStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString()}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (!isAdmin() && !isStationMaster()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access the dashboard.
          </p>
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
            {isAdmin() ? 'Admin Dashboard' : 'Station Master Dashboard'}
          </h1>
          <p className="text-gray-600">
            Welcome back, {currentUser?.username}! 
            {isStationMaster() && stationName && (
              <span> Managing {stationName} ({stationId})</span>
            )}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isStationMaster() ? 'Station Bookings' : 'Total Bookings'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {isStationMaster() ? 'Station Revenue' : 'Total Revenue'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Stations</p>
                <p className="text-2xl font-bold text-gray-900">{totalStations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{cancelledBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Only show for Admin */}
        {isAdmin() && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowAddStationModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Station
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isStationMaster() ? 'Recent Station Bookings' : 'Recent Bookings'}
              </h3>
            </div>
            <div className="p-6">
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {isStationMaster() ? 'No recent station bookings' : 'No recent bookings'}
                </p>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id || booking._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.fromStation} → {booking.toStation}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.username || booking.user?.username} • {formatDate(booking.date || booking.bookingDate)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Seats: {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isStationMaster() ? 'Popular Routes from Station' : 'Popular Routes'}
              </h3>
            </div>
            <div className="p-6">
              {popularRoutes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No route data available</p>
              ) : (
                <div className="space-y-4">
                  {popularRoutes.map(([route, count], index) => (
                    <div key={route} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                        <span className="text-sm text-gray-900">{route}</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{count} bookings</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Station Management Table - Only show for Admin */}
        {isAdmin() && (
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Stations ({stations.length})</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station Name</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stations.map((station) => (
                      <tr key={station.id || station._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{station.stationId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{station.city}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{station.stationName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Station Modal - Only for Admin */}
        {showAddStationModal && isAdmin() && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add New Station</h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={newStation.city}
                      onChange={(e) => setNewStation({...newStation, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter city name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Station Name</label>
                    <input
                      type="text"
                      value={newStation.stationName}
                      onChange={(e) => setNewStation({...newStation, stationName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter station name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Station ID</label>
                    <input
                      type="text"
                      value={newStation.stationId}
                      onChange={(e) => setNewStation({...newStation, stationId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter station ID"
                    />
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm">{error}</div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddStation}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Station'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}

export default Dashboard