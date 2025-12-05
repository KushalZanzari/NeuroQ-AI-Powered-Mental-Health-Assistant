import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  HeartIcon,
  EnvelopeIcon, LinkIcon
} from "@heroicons/react/24/outline";


const Layout = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ====================== TOP NAVBAR ====================== */}
      <nav className="w-full border-b border-border bg-card px-6 py-4 shadow-sm flex items-center justify-between">

        {/* Left Section - Logo + Nav */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <HeartIcon className="h-7 w-7 text-primary-600" />
            <span className="text-lg font-bold">NeuroQ</span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link to="/dashboard" className="hover:text-primary-500 flex items-center space-x-1">
              <HomeIcon className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link to="/chat" className="hover:text-primary-500 flex items-center space-x-1">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              <span>AI Chat</span>
            </Link>

            <Link to="/profile" className="hover:text-primary-500 flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </div>
        </div>

        {/* Right Section - Theme + User + Logout */}
        <div className="flex items-center space-x-4">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-outline flex items-center space-x-1 px-3 py-1"
          >
            {theme === "dark" ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          <span className="text-sm font-medium">@{user?.username}</span>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-md hover:bg-accent transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>

      </nav>

      {/* ====================== MAIN CONTENT ====================== */}
      <main className="flex-grow p-6">
        <Outlet />
      </main>

      {/* ====================== FOOTER ====================== */}
      <footer className="border-t border-border bg-card px-6 py-6 mt-8 text-muted-foreground">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">

          {/* About Section */}
          <div>
            <h4 className="text-foreground font-semibold mb-2">About NeuroQ</h4>
            <p>
              NeuroQ is an AI-powered mental health assistant that helps people 
              track emotions, perform check-ins, and talk safely with AI.
            </p>
          </div>

          

<div>
  <h4 className="text-foreground font-semibold mb-2">Contact</h4>

  <p className="flex items-center gap-2">
    <EnvelopeIcon className="w-4 h-4 text-primary-500" />
    <a
      href="mailto:zanzarikushal@gmail.com"
      className="text-primary-500 hover:underline"
    >
      zanzarikushal@gmail.com
    </a>
  </p>

  <p className="flex items-center gap-2 flex-justify-between">
    <LinkIcon className="w-4 h-4 text-primary-500" />
    <a
      href="https://github.com/KushalZanzari"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-500 hover:underline"
    >
      Github
    </a>
  </p>
</div>


          {/* Quick Navigation */}
          <div>
            <h4 className="text-foreground font-semibold mb-2">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link to="/dashboard" className="hover:text-primary-500">• Dashboard</Link>
              <Link to="/chat" className="hover:text-primary-500">• AI Chat</Link>
              <Link to="/profile" className="hover:text-primary-500">• Profile</Link>
            </div>
          </div>

        </div>

        <p className="text-center text-xs mt-6">
          © {new Date().getFullYear()} NeuroQ — All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
