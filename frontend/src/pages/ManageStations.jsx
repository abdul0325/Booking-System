import React, { useState, useEffect } from 'react'
import { useUser } from '../store/UserContext'
import { useBooking } from '../store/BookingContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const ManageStations = () => {
  const [editStatus, setEditStatus] = useState(false)
  const { getAllUsers } = useUser()
  const [stationUsers, setStationUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const { currentUser } = useUser()
  const { stations, loadStations } = useBooking()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingStation, setEditingStation] = useState(null)
  const [formData, setFormData] = useState({
    city: '',
    stationName: '',
    stationId: ''
  })
  const [userFormData, setUserFormData] = useState({
    status: 'approved',
    assignedStationId: '',
    assignedStationName: ''
  })

  const fetchAllUsers = async () => {
    try {
      const users = await getAllUsers()
      console.log(users, 'Fetched users from context')
      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  }

  const filterStationsUsers = async () => {
    try {
      const users = await fetchAllUsers()
      const filteredStations = users.filter(user => user.role === 'station_master')
      const pendingStationUsers = filteredStations.filter(user => user.status === 'pending')
      setStationUsers(pendingStationUsers)
    } catch (error) {
      console.error('Error filtering stations by users:', error)
    }
  }

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadStations()
      filterStationsUsers() 
    }
  }, [currentUser])

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${currentUser.token}`
  })

  // Update user status and assign station
  const updateUserStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const updateData = {
        status: userFormData.status,
        ...(userFormData.assignedStationId && {
          assignedStation: {
            stationId: userFormData.assignedStationId,
            stationName: userFormData.assignedStationName
          }
        })
      }
      console.log(updateData, 'Update data for user status')

      const response = await fetch(`${API_BASE_URL}/users/${editingUser._id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update user status')
      }

      await filterStationsUsers() // Refresh users list
      setEditStatus(false)
      resetUserForm()
      setEditingUser(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create new station
  const createStation = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/stations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create station')
      }

      await loadStations() // Refresh stations list
      setShowModal(false)
      resetForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Update station
  const updateStation = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/stations/${editingStation._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update station')
      }

      await loadStations() // Refresh stations list
      setShowModal(false)
      resetForm()
      setEditingStation(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete station
  const deleteStation = async (stationId) => {
    if (!window.confirm('Are you sure you want to delete this station?')) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/stations/${stationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete station')
      }

      await loadStations() // Refresh stations list
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingStation) {
      updateStation()
    } else {
      createStation()
    }
  }

  const handleUserSubmit = (e) => {
    e.preventDefault()
    updateUserStatus()
  }

  const handleEdit = (station) => {
    setEditingStation(station)
    setFormData({
      city: station.city,
      stationName: station.stationName,
      stationId: station.stationId
    })
    setShowModal(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserFormData({
      status: 'approved',
      assignedStationId: '',
      assignedStationName: ''
    })
    setEditStatus(true)
  }

  const handleStationSelect = (stationId) => {
    const selectedStation = stations.find(station => station.stationId === stationId)
    setUserFormData({
      ...userFormData,
      assignedStationId: stationId,
      assignedStationName: selectedStation?.stationName || ''
    })
  }

  const resetForm = () => {
    setFormData({
      city: '',
      stationName: '',
      stationId: ''
    })
    setEditingStation(null)
  }

  const resetUserForm = () => {
    setUserFormData({
      status: 'approved',
      assignedStationId: '',
      assignedStationName: ''
    })
    setEditingUser(null)
  }

  const handleModalClose = () => {
    setShowModal(false)
    resetForm()
    setError(null)
  }

  const handleUserModalClose = () => {
    setEditStatus(false)
    resetUserForm()
    setError(null)
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 text-sm md:text-base">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Manage Stations</h1>
          <p className="text-gray-600 text-sm md:text-base">Add, edit, and manage bus stations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base whitespace-nowrap"
        >
          Add New Station
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm md:text-base">
          {error}
        </div>
      )}

      {/* Stations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        {stations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm md:text-base">No stations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station ID
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station Name
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stations.map((station) => (
                  <tr key={station._id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                      {station.stationId}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {station.city}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {station.stationName}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleEdit(station)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStation(station._id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Station Users */}
      {stationUsers.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            Pending Station Masters ({stationUsers.length})
          </h3>
          <div className="grid gap-4">
            {stationUsers.map(user => (
              <div key={user.id || user._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg gap-4">
                <div className="flex-1">
                  <p className="text-sm md:text-base font-medium text-gray-900">{user.username}</p>
                  <p className="text-xs md:text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.status}
                  </span>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="text-blue-600 hover:text-blue-900 text-sm md:text-base"
                  >
                    Approve & Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-md shadow-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStation ? 'Edit Station' : 'Add New Station'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station ID
                  </label>
                  <input
                    type="text"
                    value={formData.stationId}
                    onChange={(e) => setFormData({...formData, stationId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                    disabled={editingStation}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station Name
                  </label>
                  <input
                    type="text"
                    value={formData.stationName}
                    onChange={(e) => setFormData({...formData, stationName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (editingStation ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Status Modal */}
      {editStatus && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto bg-white rounded-md shadow-lg">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Approve Station Master
              </h3>
              
              <form onSubmit={handleUserSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Station Master Name
                  </label>
                  <input
                    type="text"
                    value={editingUser?.username || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm md:text-base"
                    disabled
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({...userFormData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  >
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {userFormData.status === 'approved' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Station
                    </label>
                    <select
                      value={userFormData.assignedStationId}
                      onChange={(e) => handleStationSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                      required
                    >
                      <option value="">Select a station...</option>
                      {stations.map(station => (
                        <option key={station._id} value={station.stationId}>
                          {station.stationId} - {station.stationName} ({station.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleUserModalClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageStations