import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { firstZodErrorMessage, loginSchema } from '../lib/formValidation';
import { SignUpForm } from './SignUpForm';
import { Box, Button, Container, Center, Text, Flex} from "@chakra-ui/react"; 
import bg from "../assets/morro.jpg"; 

type LoginProps = {
	startOnSignUp?: boolean;
};

type LoginLocationState = {
	from?: {
		pathname: string;
	};
};

function getErrorMessage(error: unknown) {
	return error instanceof Error ? error.message : 'Something went wrong.';
}

export default function Login({ startOnSignUp = false }: LoginProps) {
	const { isConfigured, signInWithPassword, user } = useAuth();
	const location = useLocation();
	const navigate = useNavigate();
	const redirectTo =
		(location.state as LoginLocationState | null)?.from?.pathname ?? '/dashboard';
	const [showSignUp, setShowSignUp] = useState(startOnSignUp);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		const validated = loginSchema.safeParse({ email, password });

		if (!validated.success) {
			setError(firstZodErrorMessage(validated.error));
			return;
		}

		setSubmitting(true);

		try {
			await signInWithPassword(validated.data.email, validated.data.password);
			navigate(redirectTo, { replace: true });
		} 
		catch (err) {
			setError(getErrorMessage(err));
		} 
		finally {
			setSubmitting(false);
		}
	};

	if (user) {
		return <Navigate to={redirectTo} replace />;
	}

	if (showSignUp) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
				<SignUpForm onSwitchToLogin={() => setShowSignUp(false)} />
			</div>
		);
	}

	return (
		<Box minH="100vh" w="100vw" bgSize="cover" bgRepeat="no-repeat" bgImage={`url(${bg})`}>
			<Container as="section"  centerContent> 
				<Center>
					<Box minW="300px" minH="200px" position="fixed" top="450px" bg="gray.200"  rounded="md">
						<Flex direction="column" justify="center" align="center">
							<Text textStyle="2xl"> San Luis Obispo Rental Registry </Text>
							<Text>Sign in to continue</Text>
						</Flex>


						<div className="rounded-2xl border p-8">
							{!isConfigured ? (
								<p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
									Supabase env vars are missing. Add them before signing in.
								</p>
							) : null}

							{error ? (
								<p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
									{error}
								</p>
							) : null}

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
										className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
										placeholder="you@example.com"
										required
									/>
								</div>

								<div className="space-y-2">
									<label htmlFor="password" className="block text-sm font-medium">
										Password
									</label>
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

								<Center>
									<Button
										w="120px"
										colorPalette="blue"
										type="submit"
										disabled={!isConfigured || submitting}
										className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-6 font-medium disabled:cursor-not-allowed disabled:bg-gray-400"
									>
										{submitting ? 'Signing in...' : 'Sign In'}
									</Button>
								</Center>
							</form>
						</div>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Don&apos;t have an account?{' '}
								<button
									onClick={() => setShowSignUp(true)}
									className="text-indigo-600 hover:underline font-medium cursor-pointer bg-none border-none p-0"
								>
									Sign up
								</button>
							</p>
						</div>
					</Box>
				</Center>
			</Container>
		</Box>
	);
}
