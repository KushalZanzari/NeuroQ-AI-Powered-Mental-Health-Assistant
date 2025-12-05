import React, { useEffect, useState } from "react";
import { ClockIcon, EyeIcon } from "@heroicons/react/24/outline";
import api from "../../services/api";
import { useAuthStore } from "../../store/authStore";

/**
 * RecentSubmissions
 * - Always loads real check-in history from backend → /checkin/
 * - Uses token for authorization
 * - Shows last 3 submitted check-ins
 */

const RecentSubmissions = () => {
  const { token } = useAuthStore();

  const [submissions, setSubmissions] = useState(null); // null = loading
  const [loading, setLoading] = useState(true);

  // -------------------------------------
  // Colors
  // -------------------------------------
  const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "severe":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      case "moderate":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "mild":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      default:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    }
  };

  // -------------------------------------
  // Format “2h ago”
  // -------------------------------------
  const timeAgo = (iso) => {
    if (!iso) return "";
    const then = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // load submissions
  const load = async () => {
    if (!token) {
      setSubmissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/checkin/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // normalize and only keep latest 3
      const list = Array.isArray(res.data)
        ? res.data
            .map((r) => ({
              id: r.id,
              timestamp: r.timestamp,
              title: r.title || r.prediction?.predicted_disorder || "Check-in",
              prediction: r.prediction || {},
            }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 3)
        : [];

      setSubmissions(list);
    } catch (err) {
      console.error("RECENT_SUBMISSIONS_ERROR:", err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("refresh-recent", handler);
    return () => {
      window.removeEventListener("refresh-recent", handler);
    };
  }, [token]);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Recent Submissions</h3>
        <p className="card-description">Your latest mental health check-ins</p>
      </div>

      <div className="card-content">
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Loading recent submissions...
          </div>
        )}

        {!loading && submissions?.length === 0 && (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No submissions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Complete your first mental health check-in above.
            </p>
          </div>
        )}

        {!loading && submissions?.length > 0 && (
          <div className="space-y-3">
            {submissions.map((s) => {
              const pred = s.prediction || {};
              const severity = pred.severity_level || pred.severity || "mild";
              const confidence = pred.confidence_score ?? pred.confidence ?? 0;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-muted-foreground">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm">{timeAgo(s.timestamp)}</span>
                    </div>

                    <div>
                      <p className="font-medium text-foreground">{s.title}</p>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            severity
                          )}`}
                        >
                          {severity}
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {Math.round((confidence || 0) * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title="Open details"
                    onClick={() => {
                      // open a separate page for the submission (create route /submission/:id to show details)
                      window.open(`/submission/${s.id}`, "_blank");
                    }}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentSubmissions;
