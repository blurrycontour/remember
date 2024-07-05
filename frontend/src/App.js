import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Random } from './Random';
import { Cards } from './Cards';
import { Category } from './Category';
import { Login } from './auth/Login';
import { Account } from './auth/Account';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthProvider';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Random /></ProtectedRoute>} />
          <Route path='/category' element={<ProtectedRoute><Category /></ProtectedRoute>} />
          <Route path='/category/:id' element={<ProtectedRoute><Cards /></ProtectedRoute>} />
          <Route path='/login' element={<Login />} />
          <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
