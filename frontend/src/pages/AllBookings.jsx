import React, { useEffect, useState, useMemo } from 'react'
import { useBooking } from '../store/BookingContext'
import { useUser } from '../store/UserContext'

const StationsBookings = () => {
  const { userBookings, fetchAllBookings, loading, error, updateBookingStatus } = useBooking()
  const { currentUser, loading: userLoading } = useUser()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingBooking, setUpdatingBooking] = useState(null)

  // Check authorization and get station data
  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'station_master'
  const stationId = currentUser?.assignedStation?.stationId
  const isAdmin = currentUser?.role === 'admin'

  // Filter bookings for station
  const stationBookings = useMemo(() => {
    if (!userBookings?.length) return []
    
    return userBookings.filter(booking => 
      isAdmin || booking.fromStation === stationId
    )
  }, [userBookings, stationId, isAdmin])

  // Apply filters and search
  const filteredBookings = useMemo(() => {
    return stationBookings.filter(booking => {
      const matchesFilter = filter === 'all' || booking.status === filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm || [
        booking.username,
        booking.fromStation,
        booking.toStation,
        booking._id
      ].some(field => field?.toLowerCase().includes(searchLower))
      
      return matchesFilter && matchesSearch
    })
  }, [stationBookings, filter, searchTerm])

  // Fetch data on mount
  useEffect(() => {
    if (isAuthorized && !userLoading) {
      fetchAllBookings()
    }
  }, [isAuthorized, userLoading])

  // Handle status updates - Allow both admin and station_master
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdatingBooking(bookingId)
      const res = await updateBookingStatus(bookingId, newStatus)
      console.log(res, 'status updated')
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setUpdatingBooking(null)
    }
  }

  // Utility functions
  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      pending: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  const formatTime = (time) => new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  })

  // Loading states
  if (userLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Authorization check
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={fetchAllBookings}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm sm:text-base"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Calculate stats
  const stats = {
    total: filteredBookings.length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
          {isAdmin ? 'All Station Bookings' : 'Station Bookings'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {isAdmin ? 'Manage all station bookings' : `Station: ${currentUser?.assignedStation?.stationName || stationId}`}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:flex-1 px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'blue' },
          { label: 'Confirmed', value: stats.confirmed, color: 'green' },
          { label: 'Pending', value: stats.pending, color: 'yellow' },
          { label: 'Cancelled', value: stats.cancelled, color: 'red' }
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-${color}-50 p-3 sm:p-4 rounded-lg`}>
            <h3 className={`text-xs sm:text-sm font-medium text-${color}-600`}>{label}</h3>
            <p className={`text-lg sm:text-2xl font-bold text-${color}-900`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bookings Display */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <p className="text-gray-500 text-sm sm:text-base">No bookings found</p>
            {(searchTerm || filter !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setFilter('all') }}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block sm:hidden">
              {filteredBookings.map((booking) => (
                <div key={booking._id} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        ID: {booking._id?.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500">{booking.username}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div>
                      <p className="text-sm font-medium">{booking.fromStation}</p>
                      <p className="text-xs text-gray-400">to {booking.toStation}</p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{formatDate(booking.date)}</p>
                        <p className="text-gray-400 text-xs">{formatTime(booking.time)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs {booking.totalAmount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{booking.seats?.length} seats</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {booking.seats?.map((seat, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {seat.number || seat}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mobile Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                          disabled={updatingBooking === booking._id}
                          className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          {updatingBooking === booking._id ? 'Updating...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                          disabled={updatingBooking === booking._id}
                          className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          {updatingBooking === booking._id ? 'Updating...' : 'Cancel'}
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        disabled={updatingBooking === booking._id}
                        className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        {updatingBooking === booking._id ? 'Updating...' : 'Cancel'}
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                        disabled={updatingBooking === booking._id}
                        className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 disabled:opacity-50"
                      >
                        {updatingBooking === booking._id ? 'Updating...' : 'Reconfirm'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'User', 'Route', 'Date/Time', 'Seats', 'Amount', 'Status', 'Actions'].map(header => (
                      <th key={header} className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking._id?.slice(-8)}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.username}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">
                        <div>{booking.fromStation}</div>
                        <div className="text-gray-400">to {booking.toStation}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-500">
                        <div>{formatDate(booking.date)}</div>
                        <div className="text-gray-400">{formatTime(booking.time)}</div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {booking.seats?.map((seat, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {seat.number || seat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        Rs {booking.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col xl:flex-row xl:space-x-2 space-y-1 xl:space-y-0">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                                disabled={updatingBooking === booking._id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 text-xs xl:text-sm"
                              >
                                {updatingBooking === booking._id ? 'Updating...' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                                disabled={updatingBooking === booking._id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs xl:text-sm"
                              >
                                {updatingBooking === booking._id ? 'Updating...' : 'Cancel'}
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              disabled={updatingBooking === booking._id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs xl:text-sm"
                            >
                              {updatingBooking === booking._id ? 'Updating...' : 'Cancel'}
                            </button>
                          )}
                          {booking.status === 'cancelled' && (
                            <button
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              disabled={updatingBooking === booking._id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 text-xs xl:text-sm"
                            >
                              {updatingBooking === booking._id ? 'Updating...' : 'Reconfirm'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StationsBookings