import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

const ReportsPage = () => {
  const { token } = useAuthStore();
  const [reports, setReports] = useState([]);

  const loadReports = async () => {
    try {
      const res = await api.get("/checkin/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error("Failed loading reports:", err);
    }
  };

  const deleteReport = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this report?");
    if (!ok) return;

    try {
      await api.delete(`/checkin/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from frontend
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete report.");
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Progress Reports</h1>

      {reports.length === 0 ? (
        <p className="text-muted-foreground">No reports yet.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const p = r.prediction || {};

            return (
              <div
                key={r.id}
                className="p-4 border border-border rounded-lg flex justify-between items-center bg-accent"
              >
                <div>
                  <p className="font-semibold">{p.predicted_disorder}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((p.confidence_score || 0) * 100)}% confidence
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() =>
                      alert(JSON.stringify(r.prediction, null, 2))
                    }
                    className="p-2 hover:text-blue-600"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => deleteReport(r.id)}
                    className="p-2 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
