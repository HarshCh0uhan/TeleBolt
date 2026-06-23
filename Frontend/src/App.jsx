import './App.css'
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PlanDetails from './components/PlanDetails';
import Compare from './pages/Compare';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import Plans from './pages/admin/Plans';
import PlanForm from './pages/admin/PlanForm';
import DetectedChanges from './pages/admin/DetectedChanges';
import UploadCSV from './pages/admin/UploadCSV';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Home />} />
        <Route path="/plans/:planid" element={<PlanDetails />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-admin" element={<Register isAdminRegister />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/plans" element={<Plans />} />
        <Route path="/admin/plans/create" element={<PlanForm />} />
        <Route path="/admin/plans/edit/:id" element={<PlanForm />} />
        <Route path="/admin/detected-changes" element={<DetectedChanges />} />
        <Route path="/admin/upload-csv" element={<UploadCSV />} />
      </Route>
    </Routes>
  )
}

export default App
