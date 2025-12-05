import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from "../../services/api";
import { useAuthStore } from '../../store/authStore';
import { 
  HeartIcon, 
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import SymptomForm from '../../components/Dashboard/SymptomForm';
import PredictionResult from '../../components/Dashboard/PredictionResult';
import RecentSubmissions from '../../components/Dashboard/RecentSubmissions';
import QuickStats from '../../components/Dashboard/QuickStats';
import LoadingSpinner from '../../components/UI/LoadingSpinner'; 
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, token, isLoading: authLoading } = useAuthStore();
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ---------------------------
  // ANALYZE + SAVE CHECK-IN
  // ---------------------------
  const handleSymptomSubmit = async (data) => {
  setIsLoading(true);

  try {
    const payload = {
      text: data.input_text,
      symptoms: data.selected_symptoms || [],
      overall_mood: Number(data.mood_rating),
      sleep_hours: Number(data.sleep_hours),
      stress_level: Number(data.stress_level),
    };

    console.log("ANALYZE PAYLOAD:", payload);

    // 1️⃣ — Request AI analysis
    // api has token interceptor so we can call without manual headers
    const analyzeRes = await api.post("/analyze/", payload);
    const prediction = analyzeRes.data;
    setPrediction(prediction);

    // 2️⃣ — Save the exact prediction returned by the AI to checkins storage
    // This uses your new /checkin/save endpoint that expects SavePrediction shape
    await api.post("/checkin/save", {
      predicted_disorder: prediction.predicted_disorder,
      confidence_score: prediction.confidence_score,
      severity_level: prediction.severity_level,
      recommendations: prediction.recommendations,
      next_steps: prediction.next_steps ?? "",
    });

    // 3️⃣ — Refresh other UI pieces that read stats / recent submissions
    window.dispatchEvent(new CustomEvent("session-checkin")); // optional hook
    window.dispatchEvent(new Event("refresh-stats"));
    window.dispatchEvent(new Event("refresh-recent"));

    toast.success("Analysis complete & saved!");
  } catch (err) {
    console.error("ANALYZE ERROR:", err);
    toast.error("Error analyzing or saving results");
  } finally {
    setIsLoading(false);
  }
};

  // ---------------------------
  // SAVE RESULT BUTTON
  // ---------------------------
  const handleSaveResult = async () => {
    if (!prediction) return toast.error("No result to save");

    try {
      const payload = {
        thoughts: prediction.text || "User symptoms",
        symptoms: prediction.symptoms || [],
        mood: prediction.overall_mood || 5,
        sleep_hours: prediction.sleep_hours || 7,
        stress_level: prediction.stress_level || 5,
      };

      await api.post("/checkin/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 🔥 FIRE REFRESH EVENTS
      window.dispatchEvent(new Event("session-checkin"));
      window.dispatchEvent(new Event("session-chat"));

      toast.success("Result saved!");
    } catch (err) {
      toast.error("Failed to save result");
      console.log(err);
    }
  };

  // ---------------------------
  // Start Chat
  // ---------------------------
  const handleStartChat = () => {
    navigate("/chat");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-lg text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Failed to load user info. Please login again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="flex items-center">
          <HeartIcon className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.full_name || user?.username}!
            </h1>
            <p className="text-primary-100">
              How are you feeling today? Let's check in with your mental health.
            </p>
          </div>
        </div>
      </div>

      <QuickStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <ChartBarIcon className="h-6 w-6 text-primary-600 mr-2" />
                <h2 className="card-title">Mental Health Check-in</h2>
              </div>
              <p className="card-description">
                Share how you're feeling and get personalized insights
              </p>
            </div>

            <div className="card-content">
              <SymptomForm onSubmit={handleSymptomSubmit} isLoading={isLoading} />
            </div>
          </div>

          <RecentSubmissions />
        </div>

        <div className="space-y-6">
          
          {prediction && (
            <PredictionResult 
              prediction={prediction}
              onSave={handleSaveResult}
              onStartChat={handleStartChat}
            />
          )}

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>

            <div className="card-content space-y-4">
              <button 
                onClick={handleStartChat}
                className="w-full btn btn-outline flex items-center justify-center p-4 hover:bg-accent"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Start AI Chat Session
              </button>

              <button 
                onClick={() => navigate("/reports")}
                className="w-full btn btn-outline flex items-center justify-center p-4 hover:bg-accent"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                View Progress Reports
              </button>

              <button
                onClick={() => navigate("/emergency")}
                className="w-full btn btn-outline flex items-center justify-center p-4 hover:bg-accent"
              >
               <HeartIcon className="h-5 w-5 mr-2" />
               Stress Relief Activities
              </button>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Crisis Support
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  If you're having thoughts of self-harm, please contact emergency services immediately or call a crisis hotline.
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                  National Suicide Prevention Lifeline: 988
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
