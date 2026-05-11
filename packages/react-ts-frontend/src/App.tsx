import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import PropertyRegForm_Landlord from "./forms/Form_PropRegLandlord.tsx"; 
import PropertyRegForm_Tenant from "./forms/Form_PropRegTenant.tsx"; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
		<Route path="/landlordpropreg" element={<PropertyRegForm_Landlord />} />
		<Route path="/tenantpropreg" element={<PropertyRegForm_Tenant />} />
      </Routes>
    </BrowserRouter>
  );
}
