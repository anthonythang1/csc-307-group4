import { useState } from 'react';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
}

export function LoginForm({ onSwitchToSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });
  };

  return (
    <div className="w-full max-w-md px-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2">Rental Registry Dashboard</h1>
        <p className="text-muted-foreground">Sign in to your account</p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          type="button"
          className="w-full px-4 py-3 bg-white border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          className="w-full px-4 py-3 bg-black text-white border border-border rounded-lg hover:bg-black/90 transition-colors flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M16.365 8.458c-.05 4.844 4.236 6.458 4.286 6.48-.035.112-0.67 2.29-2.21 4.54-1.332 1.946-2.715 3.885-4.893 3.925-2.135.04-2.823-1.267-5.263-1.267-2.44 0-3.204 1.227-5.225 1.307-2.098.08-3.709-2.113-5.051-4.054-2.74-3.965-4.836-11.199-2.023-16.074 1.394-2.416 3.885-3.946 6.587-3.986 2.057-.04 3.998 1.383 5.263 1.383 1.264 0 3.634-1.71 6.127-1.458 1.043.044 3.973.421 5.855 3.172-.151.094-3.495 2.042-3.453 6.092M13.327 3.23c1.117-1.354 1.87-3.234 1.664-5.106-1.608.065-3.555 1.071-4.71 2.42-1.034 1.197-1.94 3.11-1.697 4.948 1.795.14 3.627-.913 4.743-2.262"/>
          </svg>
          Continue with Apple
        </button>

        <button
          type="button"
          className="w-full px-4 py-3 bg-white border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          Continue with Phone
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
              Remember me
            </label>
          </div>
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignUp} className="text-primary hover:underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
