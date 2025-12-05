import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  SunIcon, 
  MoonIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Title */}
        <div className="flex-1 md:flex-none">
          <h1 className="text-2xl font-bold text-foreground">NeuroQ</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="hidden md:block text-sm font-medium">
                {user?.full_name || user?.username}
              </span>
            </button>

            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
                    <p className="font-medium">{user?.full_name}</p>
                    <p>{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
