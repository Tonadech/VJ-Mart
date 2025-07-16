import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Import page components (to be created)
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import HRDashboard from "./pages/HRDashboard";
import Form from "./pages/Form";
import CheckForm from "./pages/CheckForm";
import Forgot from "./pages/Forgot";
import Reset from "./pages/Reset";
import Test from "./pages/Test";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hrdashboard" element={<HRDashboard />} />
        <Route path="/form" element={<Form />} />
        <Route path="/checkform" element={<CheckForm />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/reset" element={<Reset />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </Router>
  );
}

export default App;
