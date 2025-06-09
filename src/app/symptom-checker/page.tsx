"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import JsonMessageContent from "../../../components/chat/JsonMessageContent";

const severityOptions = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

export default function SymptomCheckerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const userMessage = `I have the following symptoms: ${symptoms}. Severity: ${severity}. Duration: ${duration}. Please analyze and provide probable conditions and next steps (self-care or doctor visit).`;
      const response = await fetch("/api/chat/medical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to get response");
      setResult(data.message);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2 text-blue-700">🩺 Symptom Checker</h1>
        <p className="mb-6 text-gray-600">Enter your symptoms, severity, and duration. Our AI will suggest possible conditions and next steps. This is not a diagnosis. Always consult a healthcare professional for serious concerns.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Symptoms</label>
            <textarea
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
              rows={3}
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              required
              placeholder="e.g. headache, sore throat, fever"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Severity</label>
            <select
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 text-gray-900"
              value={severity}
              onChange={e => setSeverity(e.target.value)}
              required
            >
              <option value="">Select severity</option>
              {severityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Duration</label>
            <input
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 text-gray-900 placeholder-gray-500"
              type="text"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
              placeholder="e.g. 2 days, 1 week"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Check Symptoms"}
          </button>
        </form>
        {error && <div className="mt-4 text-red-600">{error}</div>}
        {result && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">AI Analysis</h2>
            {typeof result === "object" && result !== null ? (
              <JsonMessageContent content={result} isUser={false} />
            ) : (
              <pre className="whitespace-pre-wrap text-gray-800 text-sm">{result}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 