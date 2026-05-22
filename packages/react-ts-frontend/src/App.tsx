import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import PropertyRegisterLL from "./pages/Form_PropRegLandlord.tsx"; 
//import LeaseRegister from "./pages/Form_LeaseReg.tsx"; 


export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Login />} />
				<Route path="/propertyreg" element={<PropertyRegisterLL />} />
			</Routes>
</BrowserRouter>
);
}
