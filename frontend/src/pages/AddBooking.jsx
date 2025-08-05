import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../store/UserContext'
import { useBooking } from '../store/BookingContext'

function AddBooking() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentUser } = useUser()
  const bookingContext = useBooking()
  
  // Add error handling for missing context
  if (!bookingContext) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Booking context is not available. Please make sure BookingProvider is properly configured.
          </div>
        </div>
      </div>
    )
  }
  
  const { stations, getAvailableSeats, createBooking, calculateFare, fetchUserBookings } = bookingContext
  
  const [formData, setFormData] = useState({
    travelType: 'economy',
    fromStation: searchParams.get('fromStation') || '',
    toStation: searchParams.get('toStation') || '',
    date: searchParams.get('date') || '',
    time: '',
    seats: []
  })
  
  const [availableSeats, setAvailableSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const getCurrentMonthDates = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const dates = []
    for (let day = today.getDate(); day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      })
    }
    return dates
  }

  const timeSlots = [
    { value: '06:00', label: '6:00 AM' },
    { value: '08:00', label: '8:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '22:00', label: '10:00 PM' }
  ]

  useEffect(() => {
    const loadSeats = async () => {
      if (formData.fromStation && formData.toStation && formData.date && formData.time && getAvailableSeats) {
        try {
          const seats = await getAvailableSeats(formData.fromStation, formData.toStation, formData.date, formData.time)
          setAvailableSeats(seats || [])
        } catch (err) {
          console.error('Error loading seats:', err)
          setAvailableSeats([])
        }
      }
    }
    
    loadSeats()
  }, [formData.fromStation, formData.toStation, formData.date, formData.time, getAvailableSeats])

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (["fromStation", "toStation", "date", "time"].includes(name)) {
      setSelectedSeats([])
    }
  }

  const handleSeatClick = (seatNumber) => {
    setSelectedSeats(prev => prev.includes(seatNumber) ? prev.filter(seat => seat !== seatNumber) : [...prev, seatNumber])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (!currentUser) {
        setError('Please login to book tickets')
        return
      }
      if (selectedSeats.length === 0) {
        setError('Please select at least one seat')
        return
      }
      if (formData.fromStation === formData.toStation) {
        setError('Origin and destination cannot be the same')
        return
      }
      if (!createBooking) {
        setError('Booking service is not available')
        return
      }
      const bookingData = {
        ...formData,
        seats: selectedSeats.map(seatNumber => ({ number: seatNumber })),
        userId: currentUser.id,
        username: currentUser.username
      }
      const newBooking = await createBooking(bookingData);
      setSuccess(`Booking confirmed! Booking ID: ${newBooking._id || newBooking.id}`);
      if (fetchUserBookings) {
        await fetchUserBookings();
      }
      setTimeout(() => { navigate('/showbooking'); }, 2000);
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Add fallback for calculateFare function
  const [farePerSeat, setFarePerSeat] = useState(0)
  
  // Calculate fare when form data changes
  useEffect(() => {
    const calculateFormFare = async () => {
      if (formData.fromStation && formData.toStation && formData.travelType && calculateFare) {
        try {
          const fare = await calculateFare(formData.fromStation, formData.toStation, formData.travelType)
          setFarePerSeat(fare)
        } catch (err) {
          console.error('Error calculating fare:', err)
          // Fallback calculation
          const baseFare = formData.travelType === 'business' ? 2000 : 1500
          setFarePerSeat(baseFare)
        }
      }
    }
    
    calculateFormFare()
  }, [formData.fromStation, formData.toStation, formData.travelType, calculateFare])

  const totalAmount = selectedSeats.length * farePerSeat

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-[#065084] mb-4">Book Your Ticket</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="md:col-span-2 bg-white border border-[#78B9B5] rounded shadow p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <label className={`flex-1 border rounded px-2 py-2 cursor-pointer text-center ${formData.travelType === 'economy' ? 'border-[#0F828C] bg-[#e6f2f1]' : 'border-[#78B9B5] bg-white'}`}> 
                  <input type="radio" name="travelType" value="economy" checked={formData.travelType === 'economy'} onChange={handleFormChange} className="sr-only" />
                  <span className="font-medium text-[#065084]">Economy</span>
                </label>
                <label className={`flex-1 border rounded px-2 py-2 cursor-pointer text-center ${formData.travelType === 'business' ? 'border-[#320A6B] bg-[#f3f0fa]' : 'border-[#78B9B5] bg-white'}`}> 
                  <input type="radio" name="travelType" value="business" checked={formData.travelType === 'business'} onChange={handleFormChange} className="sr-only" />
                  <span className="font-medium text-[#320A6B]">Business</span>
                </label>
              </div>
              <div className="flex gap-4">
                <select name="fromStation" value={formData.fromStation} onChange={handleFormChange} className="flex-1 px-3 py-2 border border-[#78B9B5] rounded text-[#065084]" required>
                  <option value="">From</option>
                  {(stations || []).map(station => (
                    <option key={station.id} value={station.stationId}>{station.city}</option>
                  ))}
                </select>
                <select name="toStation" value={formData.toStation} onChange={handleFormChange} className="flex-1 px-3 py-2 border border-[#78B9B5] rounded text-[#065084]" required>
                  <option value="">To</option>
                  {(stations || []).map(station => (
                    <option key={station.id} value={station.stationId}>{station.city}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <select name="date" value={formData.date} onChange={handleFormChange} className="flex-1 px-3 py-2 border border-[#78B9B5] rounded text-[#065084]" required>
                  <option value="">Date</option>
                  {getCurrentMonthDates().map(date => (
                    <option key={date.value} value={date.value}>{date.label}</option>
                  ))}
                </select>
                <select name="time" value={formData.time} onChange={handleFormChange} className="flex-1 px-3 py-2 border border-[#78B9B5] rounded text-[#065084]" required>
                  <option value="">Time</option>
                  {timeSlots.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
              </div>
              {error && <div className="rounded bg-[#fbeaea] p-2 text-[#b91c1c] text-sm">{error}</div>}
              {success && <div className="rounded bg-[#eafbf2] p-2 text-[#065084] text-sm">{success}</div>}
              <button type="submit" disabled={loading || selectedSeats.length === 0} className="w-full bg-[#0F828C] text-white py-2 rounded hover:bg-[#065084] transition-colors font-medium disabled:opacity-50">{loading ? 'Processing...' : 'Book Now'}</button>
            </form>
          </div>
          {/* Seat Selection */}
          <div className="bg-white border border-[#78B9B5] rounded shadow p-4">
            <h3 className="text-lg font-semibold text-[#065084] mb-2">Select Seats</h3>
            {formData.fromStation && formData.toStation && formData.date && formData.time ? (
              <>
                <div className="mb-2 text-sm text-[#065084]">Available: {availableSeats.filter(seat => seat.available).length} | Selected: {selectedSeats.length}</div>
                <div className="grid grid-cols-4 gap-1 mb-2">
                  {availableSeats.map(seat => (
                    <button
                      key={seat.number}
                      type="button"
                      onClick={() => handleSeatClick(seat.number)}
                      disabled={!seat.available}
                      className={`w-9 h-9 rounded text-xs font-medium transition-all border ${!seat.available ? 'bg-[#fbeaea] text-[#b91c1c] border-[#fbeaea] cursor-not-allowed' : selectedSeats.includes(seat.number) ? 'bg-[#0F828C] text-white border-[#0F828C]' : 'bg-[#e6f2f1] text-[#065084] border-[#78B9B5] hover:bg-[#78B9B5] hover:text-[#320A6B]'}`}
                    >
                      {seat.number}
                    </button>
                  ))}
                </div>
                {selectedSeats.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedSeats.map(seat => (
                        <span key={seat} className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#78B9B5] text-[#320A6B]">Seat {seat}</span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-[#065084] font-medium">Total:</span>
                      <span className="text-base font-bold text-[#0F828C]">PKR {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-[#065084] text-sm">Select route and time to view available seats</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddBooking