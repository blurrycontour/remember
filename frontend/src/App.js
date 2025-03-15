import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Random } from './core/Random';
import { Cards } from './core/Cards';
import { Search } from './core/Search';
import { Category } from './core/Category';
import { Footer } from './core/Footer';
import { Header } from './core/Header';
import { NotFound } from './core/Utils';
import { SwipeableRoutes } from './core/Swipeable';
import { Login } from './auth/Login';
import { Account } from './auth/Account';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthProvider';

import './css/Common.css';
import './css/Button.css';


const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function App()
{
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<SwipeableRoutes><Layout /></SwipeableRoutes>}>
            <Route path='/' element={<ProtectedRoute><Random /></ProtectedRoute>} />
            <Route path='/random' element={<ProtectedRoute><Random /></ProtectedRoute>} />
            <Route path='/category' element={<ProtectedRoute><Category /></ProtectedRoute>} />
            <Route path='/category/:id' element={<ProtectedRoute><Cards /></ProtectedRoute>} />
            <Route path='/search' element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path='/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
          </Route>
          <Route element={<Layout />}>
            <Route path='*' element={<NotFound />} />
          </Route>
          <Route path='/login' element={<Login />} />
        </Routes>
      </AuthProvider>
    </Router >
  );
}

export default App;
