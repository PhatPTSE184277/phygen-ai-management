import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-pink-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg mr-3"></div>
              <span className="text-xl font-bold text-gray-900">ExamPro</span>
            </div>
            <nav className="flex space-x-8">
              <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium">Features</Link>
              <Link to="/blog" className="text-gray-700 hover:text-gray-900 font-medium">Service</Link>
              <Link to="/contact" className="text-gray-700 hover:text-gray-900 font-medium">About Us</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign In</Link>
              <Link to="/register" className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-800 font-medium">Get Started</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <div className="max-w-6xl w-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="lg:flex">
              {/* Left side - Form */}
              <div className="lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-sm mx-auto">
                  <div className="text-center mb-8">

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-600">Sign in to your account</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter Email"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-200 placeholder-gray-500"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:bg-white outline-none transition-all duration-200 placeholder-gray-500 pr-12"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    {error && (
                      <div className="text-red-600 text-sm text-center bg-red-50 py-2 px-4 rounded-xl">
                        {error}
                      </div>
                    )}



                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={20} />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>

                    <div className="text-center">
                      <p className="text-gray-500 text-sm mb-4">Or continue with</p>
                      <div className="flex justify-center space-x-4">
                        <button type="button" className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                        </button>
                        <button type="button" className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                        </button>
                        <button type="button" className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right side - Illustration */}
              <div className="lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-8 lg:p-12 flex items-center justify-center text-white relative overflow-hidden">
                <div className="text-center relative z-10">
                  <div className="mb-8 relative">
                    {/* Modern Dashboard Mockup */}
                    <div className="relative mx-auto w-80 h-64 mb-6">
                      {/* Main Dashboard Card */}
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4 transform rotate-3">
                        <div className="h-full bg-white/30 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 bg-blue-400 rounded-lg"></div>
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                              <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-white/40 rounded w-3/4"></div>
                            <div className="h-3 bg-white/40 rounded w-1/2"></div>
                            <div className="h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded mt-4"></div>
                          </div>
                        </div>
                      </div>

                      {/* Secondary Card */}
                      <div className="absolute top-8 right-4 w-32 h-40 bg-white/15 backdrop-blur-sm rounded-xl p-3 transform -rotate-6">
                        <div className="w-6 h-6 bg-pink-400 rounded-lg mb-2"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-white/40 rounded w-full"></div>
                          <div className="h-2 bg-white/40 rounded w-2/3"></div>
                          <div className="h-2 bg-white/40 rounded w-1/2"></div>
                        </div>
                      </div>

                      {/* Floating Elements */}
                      <div className="absolute top-4 left-8 w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center transform rotate-12">
                        <div className="w-6 h-6 bg-white rounded-lg"></div>
                      </div>

                      <div className="absolute bottom-8 left-4 w-10 h-10 bg-pink-400 rounded-full"></div>
                      <div className="absolute top-12 right-12 w-8 h-8 bg-yellow-400 rounded-lg transform rotate-45"></div>
                    </div>
                  </div>

                  <h2 className="text-4xl font-bold mb-4">Manage your<br />exams more<br />quickly. ✨</h2>
                  <p className="text-xl mb-6 text-blue-100">
                    Don't have an account? <Link to="/register" className="text-yellow-300 hover:text-yellow-200 underline font-semibold">Register now!</Link>
                  </p>

                  <div className="flex justify-center space-x-4 mt-8">
                    <button className="bg-slate-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                      Get Started
                    </button>
                    <button className="text-white border border-white/30 px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors">
                      Explore Now
                    </button>
                  </div>
                </div>

                {/* Background decorative elements */}
                <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-2xl transform rotate-12"></div>
                <div className="absolute bottom-10 right-10 w-12 h-12 bg-white/10 rounded-full"></div>
                <div className="absolute top-1/2 left-5 w-8 h-8 bg-white/5 rounded-lg transform rotate-45"></div>
                <div className="absolute bottom-20 left-20 w-6 h-6 bg-cyan-400/60 rounded-full"></div>
                <div className="absolute top-20 right-20 w-10 h-10 bg-pink-400/60 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;