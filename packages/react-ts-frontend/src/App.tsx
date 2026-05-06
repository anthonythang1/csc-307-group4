import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
