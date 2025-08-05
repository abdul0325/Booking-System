import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../store/UserContext'

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signup } = useUser()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.username || !formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      const res= await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      if(res.token){

  
        navigate('/login');  }
        else{
        setError('Registration failed. Please try again.');
        }
    } catch (err) {
      setError('Registration failed. Server Error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-md bg-white border border-[#78B9B5] rounded shadow p-6">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-[#320A6B] rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#065084]">Create Account</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            id="username"
            name="username"
            type="text"
            required
            className="block w-full px-3 py-2 border border-[#78B9B5] rounded text-[#065084] focus:outline-none"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full px-3 py-2 border border-[#78B9B5] rounded text-[#065084] focus:outline-none"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-[#78B9B5] rounded text-[#065084] focus:outline-none"
          >
            <option value="user">Regular User</option>
            <option value="station_master">Station Master</option>
            <option value="admin">Admin/Owner</option>
          </select>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="block w-full px-3 py-2 border border-[#78B9B5] rounded text-[#065084] focus:outline-none"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="block w-full px-3 py-2 border border-[#78B9B5] rounded text-[#065084] focus:outline-none"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {error && (
            <div className="rounded bg-[#fbeaea] p-2 text-[#b91c1c] text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#320A6B] text-white py-2 rounded hover:bg-[#0F828C] transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-[#065084]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#0F828C] hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp