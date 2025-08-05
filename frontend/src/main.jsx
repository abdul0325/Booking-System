import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from './store/UserContext'
import { BookingProvider } from './store/BookingContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <BookingProvider>
    <App />
        </BookingProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)
