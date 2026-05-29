import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from "./auth/ProtectedRoute.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import PropertyRegisterLL from "./pages/Form_PropRegLandlord.tsx"; 
import Dashboard from './pages/Dashboard.tsx';
//import LeaseRegister from "./pages/Form_LeaseReg.tsx"; 


export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
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
			</Routes>
</BrowserRouter>
);
}
