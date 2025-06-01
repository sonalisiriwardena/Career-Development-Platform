import { Link } from 'react-router-dom';
import { Briefcase, MessageSquare, User } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold">CareerConnect</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/jobs" className="text-gray-600 hover:text-gray-900">
                  <Briefcase className="h-6 w-6" />
                </Link>
                <Link to="/messages" className="text-gray-600 hover:text-gray-900">
                  <MessageSquare className="h-6 w-6" />
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                  <User className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}