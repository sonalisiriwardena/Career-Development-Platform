import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Messages from './pages/Messages';
import AddJob from './pages/AddJob';
import CareerChatbot from './components/CareerChatbot';

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/add" element={<AddJob />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/messages" element={<Messages />} />
        </Routes>
      </main>
      
      {/* Only show chatbot for authenticated users */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {chatOpen && (
            <div className="mb-2">
              <CareerChatbot />
              <button
                className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 text-gray-600 shadow"
                onClick={() => setChatOpen(false)}
                aria-label="Close chatbot"
                style={{ zIndex: 60 }}
              >
                ✕
              </button>
            </div>
          )}
          {!chatOpen && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl focus:outline-none"
              onClick={() => setChatOpen(true)}
              aria-label="Open chatbot"
            >
              💬
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;