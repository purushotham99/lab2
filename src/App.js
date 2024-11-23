import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import AuthPage from './components/AuthPage';
import TaskPage from './components/TaskPage';

function App() {
  const userId = Cookies.get('userId');

  return (
    <Router>
      <Routes>
        <Route path="/" element={userId ? <Navigate to="/tasks" /> : <AuthPage />} />
        <Route path="/tasks" element={userId ? <TaskPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
