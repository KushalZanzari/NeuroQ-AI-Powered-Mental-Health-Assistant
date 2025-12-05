import React, { useState } from 'react';
import { 
  PlusIcon, 
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const ChatHeader = ({ 
  currentSession, 
  onNewSession, 
  onShowHistory,
  onExportChat,
  onClearChat,
  onOpenSettings
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClick = (callback) => {
    callback();
    setIsMenuOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      <div className="flex items-center space-x-3">
        <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary-600" />
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {currentSession?.name || "New Chat"}
          </h2>

          <p className="text-sm text-muted-foreground">
            {currentSession 
              ? `Started ${new Date(currentSession.created_at).toLocaleDateString()}`
              : 'Your AI mental health companion'
            }
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onNewSession}
          className="btn btn-outline flex items-center space-x-1"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Chat</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-50">
              <div className="py-1">
                <button 
                  onClick={() => handleClick(onShowHistory)}
                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  Chat History
                </button>

                <button 
                  onClick={() => handleClick(onExportChat)}
                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  Export Chat
                </button>

                <button 
                  onClick={() => handleClick(onClearChat)}
                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  Clear Chat
                </button>

                <hr className="my-1 border-border" />

                <button 
                  onClick={() => handleClick(onOpenSettings)}
                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                >
                  Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
