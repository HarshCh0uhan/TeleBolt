import './App.css'
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <Routes>
      <Route path="/plans" element={<Home/>} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile/>
        </ProtectedRoute>
      } />
      <Route path='/admin/plans' component={
        <ProtectedRoute adminOnly={true}>
          <AdminPlans/>
        </ProtectedRoute>
      }/>
    </Routes>
  )
}

export default App
