
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CheckCircle, Calendar, Book, Settings, ListTodo, Target } from 'lucide-react';

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={24} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckCircle size={24} /> },
    { name: 'Habits', path: '/habits', icon: <ListTodo size={24} /> },
    { name: 'Goals', path: '/goals', icon: <Target size={24} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={24} /> },
    { name: 'Journal', path: '/journal', icon: <Book size={24} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={24} /> },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-lg z-50 px-2 py-2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center p-2 rounded-full transition-colors ${
              isActive(item.path) 
                ? 'text-primary' 
                : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
            }`}
          >
            <div className={`p-1 ${isActive(item.path) ? 'bg-primary/10 rounded-full' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavbar;
