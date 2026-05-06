import { useState } from 'react';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }
    console.log('Sign up attempt:', { firstName, lastName, email, password });
  };

  return (
    <div className="w-full max-w-md px-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2">Create Account</h1>
        <p className="text-muted-foreground">Join the Rental Registry Dashboard</p>
      </div>

      <div className="space-y-3 mb-6">
        <button
          type="button"
          className="w-full px-4 py-3 bg-white border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-3"
        >
          <svg width="20" height="70" viewBox="0 0 20 20" fill="none">
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
          <svg width="18" height="70" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.05 13.5c-.02 3.41 2.97 4.54 3.01 4.56-.03.08-.47 1.61-1.56 3.19-.89 1.36-1.91 2.73-3.44 2.76-1.5.03-1.98-.89-3.7-.89-1.71 0-2.25.89-3.67.92-1.48.02-2.6-1.47-3.55-2.82-1.92-2.78-3.39-7.86-1.42-11.28.97-1.7 2.72-2.77 4.63-2.8 1.44-.02 2.81.97 3.68.97.87 0 2.55-1.2 4.3-1.02.71.03 2.79.28 4.11 2.23-.11.07-2.45 1.43-2.43 4.28z"/>          </svg>
          Continue with Apple
        </button>      

        <button
          type="button"
          className="w-full px-4 py-3 bg-white border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-3"
        >
          <svg width="20" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="First name"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Last name"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-email" className="block">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="signup-password" className="block">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Create a password"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-password" className="block">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="w-4 h-4 mt-1 rounded border-border"
            required
          />
          <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Create Account
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-primary hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
