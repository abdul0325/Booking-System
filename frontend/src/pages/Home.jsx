import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useBooking } from '../store/BookingContext'

function Home() {
  const { stations } = useBooking()
  const [searchData, setSearchData] = useState({
    fromStation: '',
    toStation: '',
    date: '',
    returnDate: ''
  })

  // Get the stations array safely
  const getStationsArray = () => {
    if (!stations) return []
    
    // If stations is directly an array
    if (Array.isArray(stations)) {
      return stations
    }
    
    // If stations has a nested stations property
    if (stations.stations && Array.isArray(stations.stations)) {
      return stations.stations
    }
    
    // If stations has other possible property names, add them here
    if (stations.data && Array.isArray(stations.data)) {
      return stations.data
    }
    
    return []
  }

  const stationsArray = getStationsArray()

  // Generate dynamic popular routes based on available stations
  const popularRoutes = useMemo(() => {
    if (stationsArray.length < 2) {
      // Fallback to static routes if no stations available
      return [
        { from: 'Lahore', to: 'Karachi', business: 8290, economy: 6700 },
        { from: 'Lahore', to: 'Islamabad', business: 2450, economy: 1890 },
        { from: 'Multan', to: 'Karachi', business: 5500, economy: 4000 },
        { from: 'Lahore', to: 'Peshawar', business: 3600, economy: 2490 },
        { from: 'Karachi', to: 'Islamabad', business: 8290, economy: 6700 },
        { from: 'Faisalabad', to: 'Lahore', business: 1370, economy: 1050 }
      ]
    }

    // Create dynamic routes from available stations
    const routes = []
    const maxRoutes = 6 // Limit to 6 popular routes
    
    // Define some pricing logic based on common Pakistani city distances/popularity
    const getPricing = (fromCity, toCity) => {
      const cityPricing = {
        'Lahore': { tier: 1, base: 1500 },
        'Karachi': { tier: 1, base: 1600 },
        'Islamabad': { tier: 1, base: 1400 },
        'Rawalpindi': { tier: 2, base: 1200 },
        'Faisalabad': { tier: 2, base: 1100 },
        'Multan': { tier: 2, base: 1200 },
        'Peshawar': { tier: 2, base: 1300 },
        'Quetta': { tier: 3, base: 1800 },
        'Hyderabad': { tier: 3, base: 1000 },
        'Gujranwala': { tier: 3, base: 900 },
        'Sialkot': { tier: 3, base: 900 },
        'Bahawalpur': { tier: 3, base: 1000 },
        'Sargodha': { tier: 3, base: 800 },
        'Sukkur': { tier: 3, base: 1100 },
        'Larkana': { tier: 3, base: 1200 },
        'Mardan': { tier: 3, base: 1000 },
        'Kasur': { tier: 3, base: 700 },
        'Rahim Yar Khan': { tier: 3, base: 1100 },
        'Sahiwal': { tier: 3, base: 800 },
        'Okara': { tier: 3, base: 700 }
      }

      const fromPricing = cityPricing[fromCity] || { tier: 3, base: 1000 }
      const toPricing = cityPricing[toCity] || { tier: 3, base: 1000 }
      
      // Calculate base fare based on city tiers and distance estimate
      const tierMultiplier = (fromPricing.tier + toPricing.tier) / 2
      const baseFare = Math.round((fromPricing.base + toPricing.base) / 2 * tierMultiplier)
      
      // Add some randomization for realism
      const variance = Math.random() * 0.3 + 0.85 // 0.85 to 1.15
      const economyPrice = Math.round(baseFare * variance)
      const businessPrice = Math.round(economyPrice * 1.4) // Business is ~40% more expensive
      
      return {
        economy: economyPrice,
        business: businessPrice
      }
    }

    // Create routes from major cities first
    const majorCities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar']
    const availableMajorCities = stationsArray.filter(station => 
      majorCities.includes(station.city || station.name)
    )

    // Generate routes between major cities
    for (let i = 0; i < availableMajorCities.length && routes.length < maxRoutes; i++) {
      for (let j = i + 1; j < availableMajorCities.length && routes.length < maxRoutes; j++) {
        const fromStation = availableMajorCities[i]
        const toStation = availableMajorCities[j]
        const fromCity = fromStation.city || fromStation.name
        const toCity = toStation.city || toStation.name
        
        const pricing = getPricing(fromCity, toCity)
        
        routes.push({
          from: fromCity,
          to: toCity,
          fromStationId: fromStation.stationId || fromStation.id,
          toStationId: toStation.stationId || toStation.id,
          business: pricing.business,
          economy: pricing.economy
        })
      }
    }

    // If we need more routes and have more stations, add routes from other cities
    if (routes.length < maxRoutes) {
      const remainingStations = stationsArray.filter(station => 
        !majorCities.includes(station.city || station.name)
      )
      
      for (let i = 0; i < remainingStations.length && routes.length < maxRoutes; i++) {
        // Connect smaller cities to major cities
        const smallStation = remainingStations[i]
        const majorStation = availableMajorCities[Math.floor(Math.random() * availableMajorCities.length)]
        
        if (majorStation) {
          const fromCity = smallStation.city || smallStation.name
          const toCity = majorStation.city || majorStation.name
          const pricing = getPricing(fromCity, toCity)
          
          routes.push({
            from: fromCity,
            to: toCity,
            fromStationId: smallStation.stationId || smallStation.id,
            toStationId: majorStation.stationId || majorStation.id,
            business: pricing.business,
            economy: pricing.economy
          })
        }
      }
    }

    // Shuffle routes for variety
    return routes.sort(() => Math.random() - 0.5).slice(0, maxRoutes)
  }, [stationsArray])

  const handleSearchChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(searchData)
    window.location.href = `/addbooking?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="w-full bg-[#78B9B5] border-b-4 border-[#0F828C] py-6 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#320A6B] mb-2">
            Book Your Bus Journey
          </h1>
          <p className="text-sm sm:text-base text-[#065084] mb-4 sm:mb-6">
            Simple, secure, and reliable bus ticket booking for all major cities.
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-medium text-[#065084] mb-1">From</label>
                <select
                  name="fromStation"
                  value={searchData.fromStation}
                  onChange={handleSearchChange}
                  className="px-3 py-2 border border-[#78B9B5] rounded-lg text-[#065084] focus:ring-2 focus:ring-[#0F828C] focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="">Select departure city</option>
                  {stationsArray.map(station => (
                    <option key={station.id || station.stationId} value={station.stationId || station.id}>
                      {station.city || station.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-medium text-[#065084] mb-1">To</label>
                <select
                  name="toStation"
                  value={searchData.toStation}
                  onChange={handleSearchChange}
                  className="px-3 py-2 border border-[#78B9B5] rounded-lg text-[#065084] focus:ring-2 focus:ring-[#0F828C] focus:border-transparent text-sm sm:text-base"
                  required
                >
                  <option value="">Select destination city</option>
                  {stationsArray
                    .filter(station => (station.stationId || station.id) !== searchData.fromStation)
                    .map(station => (
                    <option key={station.id || station.stationId} value={station.stationId || station.id}>
                      {station.city || station.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs sm:text-sm font-medium text-[#065084] mb-1">Departure Date</label>
                <input
                  type="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleSearchChange}
                  className="px-3 py-2 border border-[#78B9B5] rounded-lg text-[#065084] focus:ring-2 focus:ring-[#0F828C] focus:border-transparent text-sm sm:text-base"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="flex flex-col justify-end">
                <button
                  type="submit"
                  className="bg-[#0F828C] text-white px-4 py-2 rounded-lg hover:bg-[#065084] transition-colors font-medium text-sm sm:text-base h-[42px] flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Search Buses</span>
                  <span className="sm:hidden">Search</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-[#065084] mb-4 sm:mb-6 text-center">
          Popular Routes
        </h2>
        
        {popularRoutes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm sm:text-base">Loading popular routes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {popularRoutes.map((route, index) => (
              <div key={index} className="bg-white border border-[#78B9B5] rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[#320A6B] text-sm sm:text-base">
                    {route.from} → {route.to}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#065084] flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Business Class
                    </span>
                    <span className="font-bold text-[#0F828C]">PKR {route.business.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#065084] flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Economy Class
                    </span>
                    <span className="font-bold text-[#320A6B]">PKR {route.economy.toLocaleString()}</span>
                  </div>
                </div>
                
                <Link
                  to={`/addbooking?fromStation=${route.fromStationId || route.from}&toStation=${route.toStationId || route.to}`}
                  className="block w-full bg-[#065084] text-white text-center py-2 sm:py-2.5 rounded-lg hover:bg-[#320A6B] transition-colors font-medium text-sm sm:text-base"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        )}
        
        {/* Show all routes link */}
        <div className="text-center mt-6 sm:mt-8">
          <Link
            to="/addbooking"
            className="inline-flex items-center text-[#0F828C] hover:text-[#065084] font-medium text-sm sm:text-base"
          >
            View All Available Routes
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-[#78B9B5]">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#78B9B5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#320A6B] mb-2 text-sm sm:text-base">Secure Booking</h3>
              <p className="text-[#065084] text-xs sm:text-sm">Your transactions are protected with advanced security measures</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#78B9B5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#320A6B] mb-2 text-sm sm:text-base">24/7 Support</h3>
              <p className="text-[#065084] text-xs sm:text-sm">Round-the-clock customer support for all your travel needs</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#78B9B5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#320A6B] mb-2 text-sm sm:text-base">Easy Cancellation</h3>
              <p className="text-[#065084] text-xs sm:text-sm">Flexible cancellation policy with quick refund processing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home