import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import RegisterPage from './pages/Register';
import LoginPage from './pages/Login';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/Profile';
import HistoryPage from './pages/HistoryPage';
import KnowledgePage from './pages/KnowledgePage';
import ManagePatients from './components/ManagePatients';
import AdminDashboard from './pages/AdminDashboard';
import ManageDoctors from './pages/ManageDoctors';
import AdminKnowledge from './pages/AdminKnowledge';

function App() {
  return (
    <Router>
      <div className="App font-['Arial']">
        <Routes>
          {/* Mặc định vào Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Auth Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<MainLayout><ChatPage /></MainLayout>} />
          <Route path="/chat/:id" element={<MainLayout><ChatPage /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
          <Route path="/history" element={<MainLayout><HistoryPage /></MainLayout>} />
          <Route 
          path="/manage-patients" 
          element={
            <MainLayout>
              <ManagePatients />
            </MainLayout>
          } 
        />

          <Route path="/knowledge-management" element={<MainLayout><KnowledgePage /></MainLayout>} />
          <Route path="/knowledge-global" element={<MainLayout><AdminKnowledge /></MainLayout>} />
          <Route path="/knowledge-private" element={<MainLayout><KnowledgePage /></MainLayout>} />
          <Route path="/admin-dashboard" element={<MainLayout><AdminDashboard /></MainLayout>} />
        <Route path="/admin/doctors" element={<MainLayout><ManageDoctors /></MainLayout>} />
        <Route path="/admin/patients" element={<MainLayout><ManagePatients /></MainLayout>} />
        <Route path="/knowledge-global" element={<MainLayout><AdminKnowledge /></MainLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;