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

function App() {

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home/>} />
      <Route path="/plans" element={<Home/>} />
      <Route path="/plans/:planid" element={<PlanDetails/>} />
      <Route path="/compare" element={<Compare/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/register-admin" element={<Register isAdminRegister/>} />

      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile/>
        </ProtectedRoute>
      } />
      <Route path='/admin' element={
        <ProtectedRoute adminOnly>
          <Dashboard/>
        </ProtectedRoute>
      }/>
      <Route path='/admin/plans' element={
        <ProtectedRoute adminOnly>
          <Plans/>
        </ProtectedRoute>
      }/>
      <Route path='/admin/plans/create' element={
          <ProtectedRoute adminOnly>
              <PlanForm />
          </ProtectedRoute>
      }/>
      <Route path='/admin/plans/edit/:id' element={
          <ProtectedRoute adminOnly>
              <PlanForm />
          </ProtectedRoute>
      }/>
      <Route path='/admin/detected-changes' element={
        <ProtectedRoute adminOnly>
          <DetectedChanges/>
        </ProtectedRoute>
      }/>
      <Route path='/admin/upload-csv' element={
        <ProtectedRoute adminOnly>
          <UploadCSV/>
        </ProtectedRoute>
      }/>
    </Routes>
  )
}

export default App
