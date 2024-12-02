import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import Strategic from './pages/Strategic';
import Login from './pages/login';

// Eliminamos el ProtectedRoute ya que no lo necesitamos para las rutas principales
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/maintenance"
            element={
              <MainLayout>
                <Maintenance />
              </MainLayout>
            }
          />
          <Route
            path="/strategic"
            element={
              <MainLayout>
                <Strategic />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;