import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from "./auth/ProtectedRoute.tsx";
import BackButton from "./components/BackButton.tsx";
import { useUserProfile } from "./auth/useUserProfile.ts";
import { getDefaultPathForProfile } from "./auth/userProfile.ts";
import Home from "./pages/Home.tsx";
import LandlordProperties from "./pages/LandlordProperties.tsx";
import Login from "./pages/Login.tsx";
import PropertyRegisterLL from "./pages/Form_PropRegLandlord.tsx"; 
import Dashboard from './pages/Dashboard.tsx';
//import LeaseRegister from "./pages/Form_LeaseReg.tsx"; 

function DefaultRoute() {
	const { error, loading, profile, user } = useUserProfile();

	if (loading) {
		return <p>Loading...</p>;
	}

	if (!user) {
		return <Home />;
	}

	if (error) {
		return <Home />;
	}

	const defaultPath = getDefaultPathForProfile(profile);

	if (defaultPath !== "/") {
		return <Navigate replace to={defaultPath} />;
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
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute allowedRoles={["CITY_OFFICIAL"]}>
							<Dashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/propertyreg"
					element={
						<ProtectedRoute allowedRoles={["LANDLORD"]}>
							<PropertyRegisterLL />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/landlord/properties"
					element={
						<ProtectedRoute allowedRoles={["LANDLORD"]}>
							<LandlordProperties />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
