import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import ChatMessage from '../../components/Chat/ChatMessage';
import ChatInput from '../../components/Chat/ChatInput';
import ChatHeader from '../../components/Chat/ChatHeader';
import { HeartIcon } from '@heroicons/react/24/outline';
import api from "../../services/api";

const Chat = () => {
  const { user, token } = useAuthStore();

  // ---------------------
  // NEW STATES
  // ---------------------
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);


  const messagesEndRef = useRef(null);

  // ---------------------
  // LOAD SESSIONS FROM LOCALSTORAGE
  // ---------------------
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chat_sessions")) || [];

    setSessions(saved);

    if (saved.length > 0) {
      const lastSession = saved[saved.length - 1];
      setCurrentSession(lastSession);
      setMessages(lastSession.messages);
    } else {
      startNewSession(); // create first session
    }
  }, []);

  // Auto scroll
  useEffect(() => {
  const autoScroll = localStorage.getItem("chat_autoscroll") !== "off";

  if (autoScroll) {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
}, [messages]);


  // ---------------------
  // SAVE SESSION (NEW)
  // ---------------------
  const saveSession = (session) => {
  // Get authoritative list from localStorage (avoids stale state)
  const existing = JSON.parse(localStorage.getItem("chat_sessions")) || [];

  const updated = existing.map((s) => (s.id === session.id ? session : s));

  // If session not found (defensive) -> append
  const found = updated.some((s) => s.id === session.id);
  const finalList = found ? updated : [...updated, session];

  localStorage.setItem("chat_sessions", JSON.stringify(finalList));
  setSessions(finalList);
};


  // ---------------------
  // NEW CHAT SESSION
  // ---------------------
  const startNewSession = () => {
  const newSession = {
    id: Date.now(),
    name: `Chat ${new Date().toLocaleDateString()}`,
    created_at: new Date().toISOString(),
    messages: [],
    titleGenerated: false,
  };

  // Read authoritative list
  const existing = JSON.parse(localStorage.getItem("chat_sessions")) || [];
  const updated = [...existing, newSession];

  localStorage.setItem("chat_sessions", JSON.stringify(updated));
  setSessions(updated);
  setCurrentSession(newSession);
  setMessages([]);
};



  // ---------------------
  // LOAD SESSION
  // ---------------------
  const loadSession = (session) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setShowHistory(false);
  };

  // ---------------------
  // EXPORT CHAT
  // ---------------------
  const exportChat = () => {
    const text = messages
      .map((m) => `${m.is_user_message ? "You" : "AI"}: ${m.message}`)
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentSession.name}.txt`;
    a.click();
  };

  // ---------------------
  // CLEAR CHAT
  // ---------------------
  const clearChat = () => {
    setMessages([]);

    const updated = { ...currentSession, messages: [] };
    saveSession(updated);
  };

  const openSettings = () => setShowSettings(true);


  // ---------------------
  // SEND MESSAGE TO GROQ
  // ---------------------
  const handleSendMessage = async (message) => {
    const userMessage = {
      id: Date.now(),
      message,
      is_user_message: true,
      created_at: new Date().toISOString(),
    };

    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    saveSession({ ...currentSession, messages: updatedMessages });

    setIsTyping(true);

    try {
      const response = await api.post(
        "/chat/",
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiReply = response.data.reply;
      const smartTitle = response.data.title; // ⭐ NEW — Smart Title Returned

      

    // ⭐ FINAL FIX — Always update title from fresh localStorage copy
    if (!currentSession.titleGenerated && smartTitle) {

     // 1️⃣ Load latest sessions from localStorage (avoid stale React state)
      const storedSessions = JSON.parse(localStorage.getItem("chat_sessions")) || [];

      // 2️⃣ Update the current session object
      const updatedSession = {
        ...currentSession,
        name: smartTitle,
        titleGenerated: true
      };

      // 3️⃣ Replace inside array
      const updatedSessions = storedSessions.map(s =>
      s.id === currentSession.id ? updatedSession : s
     );

     // 4️⃣ Save back to storage
     localStorage.setItem("chat_sessions", JSON.stringify(updatedSessions));

     // 5️⃣ Update React states
     setSessions(updatedSessions);
     setCurrentSession(updatedSession);
    }



      const aiMessage = {
        id: Date.now() + 1,
        message: aiReply,
        is_user_message: false,
        created_at: new Date().toISOString(),
        ai_model_used: "Groq LLaMA 3.1 70B"
      };

      updatedMessages = [...updatedMessages, aiMessage];
      setMessages(updatedMessages);

      saveSession({ ...currentSession, messages: updatedMessages });

    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        message: "⚠️ Error: Could not reach the AI server.",
        is_user_message: false,
        created_at: new Date().toISOString(),
      };

      updatedMessages = [...updatedMessages, errorMsg];
      setMessages(updatedMessages);

      saveSession({ ...currentSession, messages: updatedMessages });
    }

    setIsTyping(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">

      {/* HEADER (updated with new menu actions) */}
      <ChatHeader
        currentSession={currentSession}
        onNewSession={startNewSession}
        onShowHistory={() => setShowHistory(true)}
        onExportChat={exportChat}
        onClearChat={clearChat}
        onOpenSettings={openSettings} 
      />

      {/* HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-card p-6 rounded-lg w-96 border border-border">
            <h3 className="text-lg font-semibold mb-4">Chat History</h3>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => loadSession(s)}
                  className="w-full text-left p-3 border border-border rounded-md hover:bg-accent"
                >
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="mt-4 w-full btn btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
{showSettings && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-card p-6 rounded-lg w-96 border border-border space-y-5">

      <h3 className="text-lg font-semibold">Chat Settings</h3>

      

      {/* 2️⃣ Auto-Scroll Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable Auto-Scroll</span>
        <input
          type="checkbox"
          checked={localStorage.getItem("chat_autoscroll") !== "off"}
          onChange={() => {
            const current = localStorage.getItem("chat_autoscroll");
            localStorage.setItem("chat_autoscroll", current === "off" ? "on" : "off");
          }}
        />
      </div>

      {/* 3️⃣ FONT SIZE */}
      <div>
        <p className="text-sm mb-1">Chat Font Size</p>
        <select
          className="w-full border border-border rounded-md p-2 bg-background"
          onChange={(e) => localStorage.setItem("chat_font", e.target.value)}
          defaultValue={localStorage.getItem("chat_font") || "medium"}
        >
          <option value="small">Small</option>
          <option value="medium">Medium (default)</option>
          <option value="large">Large</option>
        </select>
      </div>

      {/* 4️⃣ BUBBLE THEME */}
      <div>
        <p className="text-sm mb-1">Chat Bubble Theme</p>
        <select
          className="w-full border border-border rounded-md p-2 bg-background"
          onChange={(e) => localStorage.setItem("chat_theme", e.target.value)}
          defaultValue={localStorage.getItem("chat_theme") || "default"}
        >
          <option value="default">Default</option>
          <option value="blue">Soft Blue</option>
          <option value="green">Soft Green</option>
          <option value="grey">Minimal Grey</option>
        </select>
      </div>

      {/* 5️⃣ Delete All Chats */}
      <button
        className="w-full bg-red-600 text-white rounded-md p-2 hover:bg-red-700"
        onClick={() => {
          if (window.confirm("Delete ALL chat sessions?")) {
            localStorage.removeItem("chat_sessions");
            window.location.reload();
          }
        }}
      >
        Delete All Chats
      </button>

      {/* CLOSE BUTTON */}
      <button
        onClick={() => setShowSettings(false)}
        className="w-full btn btn-outline"
      >
        Close
      </button>
    </div>
  </div>
)}


      {/* EXISTING CODE (UNCHANGED) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <HeartIcon className="h-16 w-16 text-primary-200 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Welcome to AI Chat</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              I'm here to help you with your mental health journey. Start a conversation below.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isTyping && localStorage.getItem("chat_typing") !== "off" && (
                 <div className="flex items-center space-x-2 text-muted-foreground">

                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-sm">AI is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t border-border p-4">
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default Chat;

