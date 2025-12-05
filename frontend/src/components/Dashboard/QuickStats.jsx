import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const QuickStats = () => {
  const { token } = useAuthStore();

  const [sessionCheckins, setSessionCheckins] = useState(0);
  const [sessionChatSessions, setSessionChatSessions] = useState(0);
  const [lastCheckin, setLastCheckin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load last check-in time only from backend (NOT totals)
  const loadLastCheckin = async () => {
    try {
      const res = await api.get("/checkin/stats");
      setLastCheckin(res.data.last_checkin || null);
    } catch (err) {
      console.error("Error loading last check-in:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset counts on login
  useEffect(() => {
    if (token) {
      setSessionCheckins(0);
      setSessionChatSessions(0);
      loadLastCheckin();
    }
  }, [token]);

  // Listen for check-in and chat events
  useEffect(() => {
    const addCheckin = () => {
      setSessionCheckins((prev) => prev + 1);
      loadLastCheckin();
    };

    const addChat = () => {
      setSessionChatSessions((prev) => prev + 1);
    };

    window.addEventListener("session-checkin", addCheckin);
    window.addEventListener("session-chat", addChat);

    return () => {
      window.removeEventListener("session-checkin", addCheckin);
      window.removeEventListener("session-chat", addChat);
    };
  }, []);

  const cards = [
    {
      title: "Number of Health Check-ins",
      value: sessionCheckins,
      change: "+ this session",
      icon: ChartBarIcon,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },

      // {
    //   title: "Current Streak",
    //   value: loading ? "…" : `${stats.streak} days`,
    //   change: "Keep it up!",
    //   icon: HeartIcon,
    //   color: "text-green-600",
    //   bg: "bg-green-100 dark:bg-green-900/20",
    // },

    {
      title: "AI Chat Sessions",
      value: sessionChatSessions,
      change: "+1 today",
      icon: ChatBubbleLeftRightIcon,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Last Check-in",
      value: lastCheckin
        ? new Date(lastCheckin).toLocaleString()
        : "—",
      change: "Recent",
      icon: ClockIcon,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm text-muted-foreground">{c.title}</p>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.change}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
