import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserList } from './pages/UserList';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import './App.css';
function App() {
    return (_jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(PublicRoute, {}), children: [_jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) })] }), _jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }), _jsx(Route, { element: _jsx(Layout, {}), children: _jsx(Route, { path: "/users", element: _jsx(UserList, {}) }) })] }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }) }));
}
export default App;
//# sourceMappingURL=App.js.map