// services/BookingServices.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Create a new booking
export const createBooking = async (bookingData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(bookingData)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Create booking error:', error);
    throw error;
  }
};

// Get current user's bookings
export const getUserBookings = async (token, page = 1, limit = 10, status = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });

    const response = await fetch(`${API_BASE_URL}/bookings/my?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Get user bookings error:', error);
    throw error;
  }
};

// Get all bookings (admin/station master)
export const getAllBookings = async (token, filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(`${API_BASE_URL}/bookings?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Get all bookings error:', error);
    throw error;
  }
};

// Get specific booking by ID
export const getBookingById = async (bookingId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    throw error;
  }
};

// Update booking status (admin/station master)
export const updateBookingStatus = async (bookingId, status, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/status`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status,bookingId })
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Update booking status error:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Cancel booking error:', error);
    throw error;
  }
};

// Get available seats for a specific route and time
// Get available seats for a specific route and time
// Get available seats for a specific route and time
export const getAvailableSeats = async (fromStation, toStation, date, time, token) => {
  try {
    const params = new URLSearchParams({
      fromStation,
      toStation,
      date,
      time
    });
    
    const response = await fetch(`${API_BASE_URL}/bookings/available-seats?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Get available seats error:', error);
    throw error;
  }
};

// Get bookings by station (for station masters)
export const getBookingsByStation = async (stationId, token, filters = {}) => {
  try {
    const params = new URLSearchParams({
      fromStation: stationId,
      ...filters
    });

    const response = await fetch(`${API_BASE_URL}/bookings?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(token)
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Get bookings by station error:', error);
    throw error;
  }
};

// Calculate fare for a route
export const calculateFare = async (fromStation, toStation, travelType) => {
  try {
    const params = new URLSearchParams({
      fromStation,
      toStation,
      travelType
    });

    const response = await fetch(`${API_BASE_URL}/bookings/fare/calculate?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Calculate fare error:', error);
    throw error;
  }
};