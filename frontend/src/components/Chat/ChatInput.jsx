import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { MicrophoneIcon } from "@heroicons/react/24/solid";
import api from "../../services/api"; // ⭐ required for calling detect-language

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [detectedLang, setDetectedLang] = useState("en");  // ⭐ NEW

  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // -----------------------------------------
  // INIT SPEECH RECOGNITION
  // -----------------------------------------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "";   // ⭐ Dynamic language
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = async (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setMessage(text);
    };

    recognition.onend = async () => {
      if (isRecording) {
        recognition.start();  
      } else {
        if (message.trim()) {
          // ⭐ AUTO LANGUAGE DETECTION HERE
          try {
            const res = await api.post("/detect-language/", { text: message });
            const lang = res.data.language;

            console.log("Detected Language:", lang);

            setDetectedLang(lang); // save language for next speech
          } catch (err) {
            console.warn("Language detection failed");
          }

          onSendMessage(message.trim());
          setMessage("");
        }
      }
    };

    recognitionRef.current = recognition;
  }, [isRecording, message, detectedLang, onSendMessage]);

  // -----------------------------------------
  // TOGGLE RECORDING
  // -----------------------------------------
  const toggleRecording = () => {
    if (!recognitionRef.current)
      return alert("Browser does not support voice input");

    if (isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
    } else {
      setMessage("");
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  // -----------------------------------------
  // ORIGINAL CODE (unchanged)
  // -----------------------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2">

      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isRecording
              ? "Listening... speak now"
              : "Type your message here... (Press Enter to send)"
          }
          disabled={disabled}
          className="w-full px-4 py-3 pr-12 border border-border rounded-lg 
                     resize-none focus:outline-none focus:ring-2 
                     focus:ring-primary-500 bg-background text-foreground"
          rows={1}
          style={{ minHeight: "48px", maxHeight: "120px" }}
        />

        {/* 🎤 MIC BUTTON */}
        <button
          type="button"
          onClick={toggleRecording}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${
            isRecording
              ? "bg-red-500 text-white animate-pulse"
              : "bg-accent text-primary-600"
          }`}
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>
      </div>

      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                   focus:outline-none focus:ring-2 focus:ring-primary-500 
                   focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed 
                   transition-colors"
      >
        <PaperAirplaneIcon className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;
