// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  fetchRestaurants,
  fetchMetrics,
  fetchTopRestaurants,
} from "../api";
import TimeSeriesChart from "../components/charts/TimeSeriesChart";
import PeakHourTable from "../components/charts/peakHourTable";

export default function Dashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topRestaurants, setTopRestaurants] = useState([]);

  // Load restaurants
  useEffect(() => {
    fetchRestaurants({})
      .then((data) => {
        console.log("Fetched restaurants:", data);
        // ✅ backend returns { data: [...] }, so fix here
        setRestaurants(data.data || []);
      })
      .catch((err) => console.error("Error fetching restaurants:", err));
  }, []);

  // Load top restaurants
  useEffect(() => {
    fetchTopRestaurants({ limit: 3 })
      .then((data) => {
        console.log("Fetched top restaurants:", data);
        setTopRestaurants(data.data || []);
      })
      .catch((err) => console.error("Error fetching top restaurants:", err));
  }, []);

  // Load metrics when a restaurant is selected
  useEffect(() => {
    if (!selectedRestaurant) return;
    setLoading(true);
    fetchMetrics({ restaurant_id: selectedRestaurant.id })
      .then((data) => {
        console.log("Fetched metrics:", data);
        setMetrics(data.data || []);
      })
      .catch((err) => console.error("Error fetching metrics:", err))
      .finally(() => setLoading(false));
  }, [selectedRestaurant]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Restaurants</h2>
        <input
          type="text"
          placeholder="Search..."
          className="w-full border rounded p-1 mb-2"
        />
        <ul>
          {restaurants.map((r) => (
            <li
              key={r.id}
              onClick={() => setSelectedRestaurant(r)}
              className={`p-2 cursor-pointer rounded ${
                selectedRestaurant?.id === r.id
                  ? "bg-blue-200"
                  : "hover:bg-blue-50"
              }`}
            >
              {r.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!selectedRestaurant && (
          <div className="text-gray-600">
            Select a restaurant to view analytics.
          </div>
        )}

        {selectedRestaurant && (
          <div>
            <h1 className="text-2xl font-bold mb-4">
              {selectedRestaurant.name} – Analytics
            </h1>

            {loading && <div>Loading metrics...</div>}

            {!loading && (
              <>
                {/* Charts */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-2xl shadow p-4">
                    <h3 className="font-semibold mb-2">Revenue & Orders</h3>
                    <TimeSeriesChart data={metrics} />
                  </div>
                  <div className="bg-white rounded-2xl shadow p-4">
                    <h3 className="font-semibold mb-2">Peak Hour Table</h3>
                    <PeakHourTable data={metrics} />
                  </div>
                </div>

                {/* Top restaurants */}
                <div className="bg-white rounded-2xl shadow p-4">
                  <h3 className="font-semibold mb-2">Top Restaurants</h3>
                  <ul>
                    {topRestaurants.map((r) => (
                      <li key={r.id} className="flex justify-between">
                        <span>{r.name}</span>
                        <span>₹{r.revenue.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
