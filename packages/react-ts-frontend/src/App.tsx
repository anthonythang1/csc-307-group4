import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from "./auth/ProtectedRoute.tsx";
import BackButton from "./components/BackButton.tsx";
import { useAuth } from "./auth/useAuth.ts";
import { apiFetch } from "./lib/api.ts";
import Home from "./pages/Home.tsx";
import LandlordProperties from "./pages/LandlordProperties.tsx";
import Login from "./pages/Login.tsx";
import PropertyRegisterLL from "./pages/Form_PropRegLandlord.tsx"; 
import Dashboard from './pages/Dashboard.tsx';
//import LeaseRegister from "./pages/Form_LeaseReg.tsx"; 

type UserProfile = {
	registryRole: "CITY_OFFICIAL" | "LANDLORD" | string;
	userId: string;
};

type ProfileLoadState = {
	error: string;
	profile: UserProfile | null;
	userId: string;
};

async function fetchUserProfile() {
	const response = await apiFetch("/api/me");

	if (!response.ok) {
		throw new Error("Could not load user profile.");
	}

	return (await response.json()) as UserProfile;
}

function DefaultRoute() {
	const { loading, user } = useAuth();
	const [profileState, setProfileState] = useState<ProfileLoadState | null>(null);
	const currentProfileState =
		profileState?.userId === user?.id ? profileState : null;

	useEffect(() => {
		if (!user) {
			return undefined;
		}

		let ignore = false;
		const userId = user.id;

		async function loadProfile() {
			try {
				const loadedProfile = await fetchUserProfile();

				if (!ignore) {
					setProfileState({
						error: "",
						profile: loadedProfile,
						userId
					});
				}
			} catch (error) {
				if (!ignore) {
					setProfileState({
						error:
							error instanceof Error
								? error.message
								: "Could not load user profile.",
						profile: null,
						userId
					});
				}
			}
		}

		void loadProfile();

		return () => {
			ignore = true;
		};
	}, [user]);

	if (loading) {
		return <p>Loading...</p>;
	}

	if (!user) {
		return <Home />;
	}

	if (!currentProfileState) {
		return <p>Loading...</p>;
	}

	if (currentProfileState.profile?.registryRole === "LANDLORD") {
		return <Navigate replace to="/landlord/properties" />;
	}

	return <Home />;
}

export default function App() {
	return (
		<BrowserRouter>
			<BackButton />
			<Routes>
				<Route path="/" element={<DefaultRoute />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Login startOnSignUp />} />
				<Route path="/dashboard" element={<Dashboard />} />
				<Route
					path="/propertyreg"
					element={
						<ProtectedRoute>
							<PropertyRegisterLL />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/landlord/properties"
					element={
						<ProtectedRoute>
							<LandlordProperties />
						</ProtectedRoute>
					}
				/>
			</Routes>
</BrowserRouter>
);
}
