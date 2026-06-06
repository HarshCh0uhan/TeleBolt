import './App.css'
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PlanDetail from './pages/PlanDetail';
import Compare from './pages/Compare';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterAdmin from './pages/RegisterAdmin';
import Profile from './pages/Profile';
import Dashboard from './pages/admin/Dashboard';
import Plans from './pages/admin/Plans';
import PlanForm from './pages/admin/PlanForm';
import DetectedChanges from './pages/admin/DetectedChanges';
import UploadCSV from './pages/admin/UploadCSV';

function App() {

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/plans" element={<Home/>} />
      <Route path="/plans/:id" element={<PlanDetail/>} />
      <Route path="/compare" element={<Compare/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/register-admin" element={<RegisterAdmin/>} />

      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile/>
        </ProtectedRoute>
      } />
      <Route path='/admin' element={
        <ProtectedRoute adminOnly={true}>
          <Dashboard/>
        </ProtectedRoute>
      }/>
      <Route path='/admin/plans' element={
        <ProtectedRoute adminOnly={true}>
          <Plans/>
        </ProtectedRoute>
      }/>
      <Route path='/admin/plans/create' element={
          <ProtectedRoute adminOnly={true}>
              <PlanForm />
          </ProtectedRoute>
      }/>
      <Route path='/admin/plans/edit/:id' element={
          <ProtectedRoute adminOnly={true}>
              <PlanForm />
          </ProtectedRoute>
      }/>
      <Route path='/admin/detected' element={
        <ProtectedRoute adminOnly={true}>
          <DetectedChanges/>
        </ProtectedRoute>
      }/>
      <Route path='/admin/upload-csv' element={
        <ProtectedRoute adminOnly={true}>
          <UploadCSV/>
        </ProtectedRoute>
      }/>
    </Routes>
  )
}

export default App
