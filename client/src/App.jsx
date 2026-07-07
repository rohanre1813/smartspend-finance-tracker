import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AccountPage from "../pages/AccountPage";
import ProtectedRoute from "../components/ProtectedRoutes";
import TransactionCreate from "../pages/TransactionCreate";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/:id"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction/create"
          element={
            <ProtectedRoute>
              <TransactionCreate />
            </ProtectedRoute>
          }
        />
        <Route path="/transaction/edit/:id" element={<TransactionCreate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
