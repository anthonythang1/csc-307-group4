import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { firstZodErrorMessage, signUpSchema } from '../lib/formValidation';
import { Button, Box, Container, Center, Text, Flex} from "@chakra-ui/react";
import bg from "../assets/sign.jpg";

interface SignUpFormProps {
  onSwitchToLogin: () => void;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function SignUpForm({ onSwitchToLogin }: SignUpFormProps) {
  const { isConfigured, signUpWithPassword } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');

    const validated = signUpSchema.safeParse({
      agreeToTerms,
      confirmPassword,
      email,
      firstName,
      lastName,
      password,
    });

    if (!validated.success) {
      setError(firstZodErrorMessage(validated.error));
      return;
    }

    setSubmitting(true);

    try {
      const result = await signUpWithPassword({
        email: validated.data.email,
        firstName: validated.data.firstName,
        lastName: validated.data.lastName,
        password: validated.data.password,
      });

      if (result.needsEmailConfirmation) {
        setStatus('Check your email to finish creating your account.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

	return (
	<Box minH="100vh" w="100vw" bgSize="cover" bgRepeat="no-repeat" bgImage={`url(${bg})`}>
	<Container as="section"  centerContent>
	<Center>
	<Box minW="400px" minH="300px" position="fixed" top="350px" bg="gray.200"  rounded="md">
		<div className="w-full max-w-md px-6">
			<Flex direction="column" justify="center" align="center">
				<Text textStyle="2xl">Create Account</Text>
			</Flex>

			{!isConfigured ? (
				<p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
					Supabase env vars are missing. Add them before signing up.
				</p>
			) : null}

			{error ? (
				<p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</p>
			) : null}

			{status ? (
				<p className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
					{status}
				</p>
			) : null}

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
							className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Mary"
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
							className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Diaz"
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
						className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="myemail@hipmail.com"
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
						className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="******"
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
						className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="******"
						required
					/>
				</div>

				<div className="flex items-start gap-2">
					<input
						id="terms"
						type="checkbox"
						checked={agreeToTerms}
						onChange={(e) => setAgreeToTerms(e.target.checked)}
						className="w-4 h-4 mt-1 rounded border-gray-300"
						required
					/>
					<label htmlFor="terms" className="text-sm text-gray-900 cursor-pointer">
						I agree to the Terms and Conditions and Privacy Policy
					</label>
				</div>

				<Center>
					<Button
						w="150px"
						colorPalette="blue"
						type="submit"
						disabled={!isConfigured || submitting}
						className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
					>
						{submitting ? 'Creating account...' : 'Create Account'}
					</Button>
				</Center>
			</form>

			<div className="mt-6 text-center">
				<p className="text-sm text-gray-600">
					Already have an account?{' '}
						<button onClick={onSwitchToLogin} className="text-indigo-600 hover:underline">
							Sign in
						</button>
				</p>
			</div>
		</div>
	</Box>
	</Center>
	</Container>
	</Box>
	);
}
