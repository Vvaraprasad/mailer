import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import { Toaster } from 'react-hot-toast'; // ✅ Import Toaster

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught in boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }
    return this.props.children;
  }
}

const App = () => {
  const token = localStorage.getItem('token');
  return (
    <ErrorBoundary>
      {/* ✅ Global Toaster for all toast notifications */}
      <Toaster position='top-right' reverseOrder={false} />

      <Routes>
        <Route
          path='/'
          element={
            token ? <Navigate to='/dashboard' /> : <Navigate to='/login' />
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route
          path='/dashboard'
          element={token ? <Dashboard /> : <Navigate to='/login' />}
        />
        <Route
          path='/templates'
          element={token ? <Templates /> : <Navigate to='/login' />}
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
