"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaArrowUp, FaArrowDown, FaHeartbeat, FaWeight, FaSyringe, FaPills, FaLightbulb } from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, AreaChart, Area
} from "recharts";

const METRIC_ICONS: any = {
  weight: <FaWeight className="text-2xl text-blue-500" />,
  blood_pressure: <FaHeartbeat className="text-2xl text-red-500" />,
  blood_sugar: <FaSyringe className="text-2xl text-pink-500" />,
  medication: <FaPills className="text-2xl text-green-500" />,
};

const MOTIVATIONAL_TIPS = [
  "Stay hydrated and get enough sleep for better health!",
  "Regular exercise helps maintain healthy blood pressure and weight.",
  "Monitor your health metrics regularly for early detection.",
  "Take your medications on time for best results.",
  "A balanced diet supports stable blood sugar levels.",
];

const METRICS = [
  { key: "weight", label: "Weight", icon: <FaWeight className="text-2xl text-blue-500" /> },
  { key: "blood_pressure", label: "Blood Pressure", icon: <FaHeartbeat className="text-2xl text-red-500" /> },
  { key: "blood_sugar", label: "Blood Sugar", icon: <FaSyringe className="text-2xl text-pink-500" /> },
  { key: "medication", label: "Medication", icon: <FaPills className="text-2xl text-green-500" /> },
];

function getLatestMetric(data: any[], metric: string) {
  if (!data || !data.length) return null;
  const last = data[data.length - 1];
  if (metric === "blood_pressure") return `${last.systolic}/${last.diastolic} mmHg`;
  if (metric === "weight") return `${last.value} kg`;
  if (metric === "blood_sugar") return `${last.value} mg/dL`;
  if (metric === "medication") return last.value;
  return null;
}

function getTrend(data: any[], metric: string) {
  if (!data || data.length < 2) return null;
  const prev = data[data.length - 2];
  const last = data[data.length - 1];
  let up = false;
  if (metric === "blood_pressure") up = (last.systolic + last.diastolic) > (prev.systolic + prev.diastolic);
  else up = last.value > prev.value;
  return up ? <FaArrowUp className="inline text-green-500 ml-1" /> : <FaArrowDown className="inline text-red-500 ml-1" />;
}

export default function MetricsDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeMetric, setActiveMetric] = useState("weight");
  const [metricsData, setMetricsData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    weight: { value: "", date: "" },
    blood_pressure: { systolic: "", diastolic: "", date: "" },
    blood_sugar: { value: "", date: "" },
    medication: { value: "", date: "", notes: "" },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tip, setTip] = useState(MOTIVATIONAL_TIPS[0]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");
    else fetchAllMetrics();
    // eslint-disable-next-line
  }, [session, status]);

  useEffect(() => {
    setTip(MOTIVATIONAL_TIPS[Math.floor(Math.random() * MOTIVATIONAL_TIPS.length)]);
  }, []);

  const fetchAllMetrics = async () => {
    setLoading(true);
    try {
      const data: any = {};
      for (const metric of METRICS) {
        const res = await fetch(`/api/metrics?type=${metric.key}`);
        if (!res.ok) throw new Error('Failed to load metrics');
        const json = await res.json();
        data[metric.key] = json.metrics || [];
      }
      setMetricsData(data);
    } catch (e: any) {
      setError(e.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (metric: string, field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [metric]: { ...prev[metric], [field]: value },
    }));
  };

  const handleAddMetric = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let body: any = { type: activeMetric, date: form[activeMetric].date };
      if (activeMetric === "weight" || activeMetric === "blood_sugar") {
        body.value = form[activeMetric].value;
      } else if (activeMetric === "blood_pressure") {
        body.systolic = form.blood_pressure.systolic;
        body.diastolic = form.blood_pressure.diastolic;
      } else if (activeMetric === "medication") {
        body.value = form.medication.value;
        body.notes = form.medication.notes;
      }
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add metric");
      setSuccess("Metric added!");
      setForm((prev: any) => ({
        ...prev,
        [activeMetric]: Object.fromEntries(Object.keys(prev[activeMetric]).map(k => [k, ""]))
      }));
      fetchAllMetrics();
    } catch (e: any) {
      setError(e.message || "Error adding metric");
    } finally {
      setLoading(false);
    }
  };

  // Format data for charts
  const getChartData = () => {
    const data = metricsData[activeMetric] || [];
    if (activeMetric === "blood_pressure") {
      return data.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString(),
        Systolic: d.systolic,
        Diastolic: d.diastolic,
      }));
    } else if (activeMetric === "medication") {
      return data.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString(),
        Medication: d.value,
        Notes: d.notes,
      }));
    } else {
      return data.map((d: any) => ({
        date: new Date(d.date).toLocaleDateString(),
        Value: d.value,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-10 px-2 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 flex items-center justify-center gap-2">
          📈 Health Metrics Dashboard
        </h1>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {METRICS.map(metric => (
            <div key={metric.key} className={`flex items-center gap-4 p-4 rounded-xl shadow transition-all duration-200 ${activeMetric === metric.key ? "bg-blue-100 border-2 border-blue-400 scale-105" : "bg-gray-50 border border-gray-200 hover:bg-blue-50"}`}
              onClick={() => setActiveMetric(metric.key)}
              style={{ cursor: 'pointer' }}
            >
              <div>{METRIC_ICONS[metric.key]}</div>
              <div>
                <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  {metric.label}
                  {getTrend(metricsData[metric.key], metric.key)}
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {getLatestMetric(metricsData[metric.key], metric.key) || '--'}
                </div>
                <div className="text-xs text-gray-500">
                  {metricsData[metric.key]?.length ? new Date(metricsData[metric.key][metricsData[metric.key].length-1].date).toLocaleDateString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Motivational Tip */}
        <div className="mb-6 flex items-center gap-3 bg-yellow-50 border-l-4 border-yellow-400 rounded p-3 shadow">
          <FaLightbulb className="text-yellow-400 text-xl" />
          <span className="text-gray-700 font-medium">{tip}</span>
        </div>
        {/* Metric Selector */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {METRICS.map(metric => (
            <button
              key={metric.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold border-2 transition-all duration-200 shadow-sm ${activeMetric === metric.key ? "bg-blue-600 text-white border-blue-700 scale-105" : "bg-white text-blue-700 border-blue-300 hover:bg-blue-100"}`}
              onClick={() => setActiveMetric(metric.key)}
            >
              <span className="text-xl">{metric.icon}</span> {metric.label}
            </button>
          ))}
        </div>
        {/* Chart Area */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-blue-800 flex items-center gap-2">
            {METRICS.find(m => m.key === activeMetric)?.icon} {METRICS.find(m => m.key === activeMetric)?.label} History
          </h2>
          <div className="w-full h-72 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-xl p-4 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              {activeMetric === "weight" || activeMetric === "blood_sugar" ? (
                <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6366f1"/>
                  <YAxis stroke="#6366f1"/>
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #a5b4fc' }}/>
                  <Area type="monotone" dataKey="Value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" isAnimationActive={true}/>
                </AreaChart>
              ) : activeMetric === "blood_pressure" ? (
                <LineChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#ef4444"/>
                  <YAxis stroke="#ef4444"/>
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #fecaca' }}/>
                  <Legend />
                  <Line type="monotone" dataKey="Systolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={true}/>
                  <Line type="monotone" dataKey="Diastolic" stroke="#f59e42" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={true}/>
                </LineChart>
              ) : (
                <BarChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#10b981"/>
                  <YAxis stroke="#10b981"/>
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #bbf7d0' }}/>
                  <Bar dataKey="Medication" fill="#10b981" isAnimationActive={true}/>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        {/* Add Entry Form */}
        <form onSubmit={handleAddMetric} className="bg-blue-50 rounded-xl p-6 shadow flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
            ➕ Add {METRICS.find(m => m.key === activeMetric)?.label} Entry
          </h3>
          {activeMetric === "weight" && (
            <>
              <div className="flex items-center gap-2"><FaWeight className="text-blue-500" /><input type="number" step="0.1" min="0" className="border rounded-md p-2 text-gray-900 placeholder-gray-500 flex-1" placeholder="Weight (kg)" value={form.weight.value} onChange={e => handleFormChange("weight", "value", e.target.value)} required /></div>
              <input type="date" className="border rounded-md p-2 text-gray-900" value={form.weight.date} onChange={e => handleFormChange("weight", "date", e.target.value)} required />
            </>
          )}
          {activeMetric === "blood_pressure" && (
            <>
              <div className="flex items-center gap-2"><FaHeartbeat className="text-red-500" /><input type="number" min="0" className="border rounded-md p-2 text-gray-900 placeholder-gray-500 flex-1" placeholder="Systolic (mmHg)" value={form.blood_pressure.systolic} onChange={e => handleFormChange("blood_pressure", "systolic", e.target.value)} required /></div>
              <div className="flex items-center gap-2"><FaHeartbeat className="text-orange-400" /><input type="number" min="0" className="border rounded-md p-2 text-gray-900 placeholder-gray-500 flex-1" placeholder="Diastolic (mmHg)" value={form.blood_pressure.diastolic} onChange={e => handleFormChange("blood_pressure", "diastolic", e.target.value)} required /></div>
              <input type="date" className="border rounded-md p-2 text-gray-900" value={form.blood_pressure.date} onChange={e => handleFormChange("blood_pressure", "date", e.target.value)} required />
            </>
          )}
          {activeMetric === "blood_sugar" && (
            <>
              <div className="flex items-center gap-2"><FaSyringe className="text-pink-500" /><input type="number" step="0.1" min="0" className="border rounded-md p-2 text-gray-900 placeholder-gray-500 flex-1" placeholder="Blood Sugar (mg/dL)" value={form.blood_sugar.value} onChange={e => handleFormChange("blood_sugar", "value", e.target.value)} required /></div>
              <input type="date" className="border rounded-md p-2 text-gray-900" value={form.blood_sugar.date} onChange={e => handleFormChange("blood_sugar", "date", e.target.value)} required />
            </>
          )}
          {activeMetric === "medication" && (
            <>
              <div className="flex items-center gap-2"><FaPills className="text-green-500" /><input className="border rounded-md p-2 text-gray-900 placeholder-gray-500 flex-1" placeholder="Medication Name" value={form.medication.value} onChange={e => handleFormChange("medication", "value", e.target.value)} required /></div>
              <input type="date" className="border rounded-md p-2 text-gray-900" value={form.medication.date} onChange={e => handleFormChange("medication", "date", e.target.value)} required />
              <textarea className="border rounded-md p-2 text-gray-900 placeholder-gray-500" placeholder="Notes (optional)" value={form.medication.notes} onChange={e => handleFormChange("medication", "notes", e.target.value)} />
            </>
          )}
          <button type="submit" className="bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2" disabled={loading}>
            {loading ? "Saving..." : `Add ${METRICS.find(m => m.key === activeMetric)?.label}`}
          </button>
          {error && <div className="text-red-600 mt-2">{error}</div>}
          {success && <div className="text-green-600 mt-2">{success}</div>}
        </form>
      </div>
    </div>
  );
} 