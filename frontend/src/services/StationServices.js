// services/stationApi.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/stations`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get auth header
const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`
});

// Get all stations
export const fetchStations = async () => {
  try {
    const res = await api.get('/');
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stations');
  }
};

// Get single station
export const fetchStation = async (id) => {
  try {
    const res = await api.get(`/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch station');
  }
};

// Create new station
export const createStation = async (stationData, token) => {
  try {
    const res = await api.post('/', stationData, {
      headers: getAuthHeader(token)
    });
    console.log("Station created with token:", token);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create station');
  }
};

// Update station
export const updateStation = async (id, updatedData, token) => {
  try {
    const res = await api.put(`/${id}`, updatedData, {
      headers: getAuthHeader(token)
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update station');
  }
};

// Delete station
export const deleteStation = async (id, token) => {
  try {
    const res = await api.delete(`/${id}`, {
      headers: getAuthHeader(token)
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete station');
  }
};

// Get stations by city
export const fetchStationsByCity = async (city) => {
  try {
    const res = await api.get(`/city/${city}`);
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch stations by city');
  }
};

// Get all cities
export const fetchCities = async () => {
  try {
    const res = await api.get('/cities');
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cities');
  }
};