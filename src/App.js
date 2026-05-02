import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mode from "./pages/Mode";
import RoundGame from "./pages/RoundGame";
import TotalGame from "./pages/TotalGame";
import TienLenGame from "./pages/TienLenGame";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Mode />} />
        <Route path="/round" element={<RoundGame />} />
        <Route path="/total" element={<TotalGame />} />
  <Route path="/tienlen" element={<TienLenGame />} />
      </Routes>
    </BrowserRouter>
  );
}
