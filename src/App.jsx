import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './AdminPage/AdminDashboard';

function App() {
    return (
        <Router>
            <Routes>
                {/* Auth routes */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Simplified routes without /dashboard prefix */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/buy-token" element={<Dashboard />} />
                <Route path="/referral" element={<Dashboard />} />
                <Route path="/level-income" element={<Dashboard />} />
                <Route path="/profile" element={<Dashboard />} />
                <Route path="/support" element={<Dashboard />} />

                {/* Admin Page */}
                <Route path="/dhanki-admin" element={<AdminDashboard />} />

                {/* Catch all - redirect to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
