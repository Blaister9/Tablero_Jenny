import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import Strategic from './pages/Strategic';
import Login from './pages/Login';

/**Este es el verdadero protectedd, el de abajo e sun desarrollo */
// const ProtectedRoute = ({ children }) => {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <div>Cargando...</div>;
//   }

//   return user ? children : <Navigate to="/login" />;
// };

const ProtectedRoute = ({ children }) => {
  // Temporalmente omitimos la verificación de `user` y `loading`.
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Maintenance />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/strategic"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Strategic />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;