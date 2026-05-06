import { useState } from 'react';
import { SignUpForm } from './SignUpForm';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleSuccess = (response: any) => {
    console.log('Google Sign-In successful:', response);
    // Handle the Google login here - send token to your backend
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => console.log('Login Failed'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
  };

  if (showSignUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <SignUpForm onSwitchToLogin={() => setShowSignUp(false)} />
      </div>
    );
  }

  if (showEmailLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">San Luis Obispo Rental Registry</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <a href="#" className="text-sm text-indigo-600 hover:underline">
                    Forgot?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-6 font-medium"
              >
                Sign In
              </button>
            </form>

            <button
              onClick={() => setShowEmailLogin(false)}
              className="w-full mt-4 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to all sign in options
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => setShowSignUp(true)}
                className="text-indigo-600 hover:underline font-medium cursor-pointer bg-none border-none p-0"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">San Luis Obispo Rental Registry</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => login()}
              className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center gap-3 font-medium"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-700">Continue with Google</span>
            </button>
        

            {/* Apple Button */}
            <button
              type="button"
              className="w-full px-6 py-4 bg-black text-white border-2 border-black rounded-xl hover:bg-gray-900 hover:shadow-md transition-all flex items-center justify-center gap-3 font-medium"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 13.5c-.02 3.41 2.97 4.54 3.01 4.56-.03.08-.47 1.61-1.56 3.19-.89 1.36-1.91 2.73-3.44 2.76-1.5.03-1.98-.89-3.7-.89-1.71 0-2.25.89-3.67.92-1.48.02-2.6-1.47-3.55-2.82-1.92-2.78-3.39-7.86-1.42-11.28.97-1.7 2.72-2.77 4.63-2.8 1.44-.02 2.81.97 3.68.97.87 0 2.55-1.2 4.3-1.02.71.03 2.79.28 4.11 2.23-.11.07-2.45 1.43-2.43 4.28z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Phone Button */}
            <button
              type="button"
              className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center gap-3 font-medium"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span className="text-gray-700">Continue with Phone</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Email Button */}
            <button
              type="button"
              onClick={() => setShowEmailLogin(true)}
              className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center gap-3 font-medium"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span className="text-gray-700">Continue with Email</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button 
              onClick={() => setShowSignUp(true)}
              className="text-indigo-600 hover:underline font-medium cursor-pointer bg-none border-none p-0"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}