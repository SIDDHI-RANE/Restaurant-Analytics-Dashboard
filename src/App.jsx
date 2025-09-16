// import { useState } from "react";
// import RestaurantList from "./components/restaurantsList.jsx";
// import Dashboard from "./components/Dashboard";

// function App() {
//   const [selectedRestaurant, setSelectedRestaurant] = useState(null);

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       {/* Sidebar */}
//       <div style={{ width: "25%", borderRight: "1px solid #ddd" }}>
//         <RestaurantList onSelect={setSelectedRestaurant} />
//       </div>

//       {/* Dashboard */}
//       <div style={{ flex: 1, overflowY: "auto" }}>
//         <Dashboard restaurant={selectedRestaurant} />
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import { parseISO, format, getHours } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";

function App() {
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "2025-06-22", end: "2025-06-28" });

  useEffect(() => {
    fetch("/data/orders.json").then(res => res.json()).then(setOrders);
    fetch("/data/restaurants.json").then(res => res.json()).then(setRestaurants);
  }, []);

  // Filter orders by restaurant & date
  const filteredOrders = orders.filter(o => {
    const orderDate = parseISO(o.order_time);
    const afterStart = orderDate >= new Date(dateRange.start);
    const beforeEnd = orderDate <= new Date(dateRange.end + "T23:59:59");
    const matchRestaurant = selectedRestaurant ? o.restaurant_id === selectedRestaurant : true;
    return afterStart && beforeEnd && matchRestaurant;
  });

  // Daily trends
  const dailyStats = {};
  filteredOrders.forEach(o => {
    const day = format(parseISO(o.order_time), "yyyy-MM-dd");
    if (!dailyStats[day]) {
      dailyStats[day] = { date: day, orders: 0, revenue: 0, amounts: [], hours: {} };
    }
    dailyStats[day].orders += 1;
    dailyStats[day].revenue += o.order_amount;
    dailyStats[day].amounts.push(o.order_amount);
    const hour = getHours(parseISO(o.order_time));
    dailyStats[day].hours[hour] = (dailyStats[day].hours[hour] || 0) + 1;
  });

  const dailyData = Object.values(dailyStats).map(d => {
    const peakHour = Object.entries(d.hours).reduce((a, b) => (b[1] > a[1] ? b : a), [0, 0])[0];
    return {
      date: d.date,
      orders: d.orders,
      revenue: d.revenue,
      aov: (d.revenue / d.orders).toFixed(2),
      peakHour,
    };
  });

  // Top 3 restaurants by revenue
  const restaurantRevenue = {};
  filteredOrders.forEach(o => {
    restaurantRevenue[o.restaurant_id] = (restaurantRevenue[o.restaurant_id] || 0) + o.order_amount;
  });
  const topRestaurants = Object.entries(restaurantRevenue)
    .map(([id, revenue]) => ({ name: restaurants.find(r => r.id === +id)?.name || id, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  return (
    <div style={{ padding: 20 }}>
      <h1>🍴 Restaurant Analytics Dashboard</h1>

      {/* Restaurant Selector */}
      <label>Select Restaurant: </label>
      <select onChange={e => setSelectedRestaurant(Number(e.target.value) || null)}>
        <option value="">All</option>
        {restaurants.map(r => (
          <option key={r.id} value={r.id}>{r.name}</option>
        ))}
      </select>

      {/* Date Range Filter */}
      <div style={{ marginTop: 10 }}>
        <label>From: </label>
        <input type="date" value={dateRange.start}
               onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
        <label> To: </label>
        <input type="date" value={dateRange.end}
               onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
      </div>

      {/* Daily Orders */}
      <h2>📊 Daily Orders</h2>
      <LineChart width={700} height={300} data={dailyData}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="orders" stroke="#8884d8" />
      </LineChart>

      {/* Daily Revenue */}
      <h2>💰 Daily Revenue</h2>
      <LineChart width={700} height={300} data={dailyData}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
      </LineChart>

      {/* Avg Order Value */}
      <h2>📈 Average Order Value</h2>
      <LineChart width={700} height={300} data={dailyData}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="aov" stroke="#ff7300" />
      </LineChart>

      {/* Peak Order Hour */}
      <h2>⏰ Peak Order Hour per Day</h2>
      <ul>
        {dailyData.map(d => (
          <li key={d.date}>{d.date}: {d.peakHour}:00 hrs</li>
        ))}
      </ul>

      {/* Top Restaurants */}
      <h2>🏆 Top 3 Restaurants by Revenue</h2>
      <BarChart width={700} height={300} data={topRestaurants}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#8884d8" />
      </BarChart>
    </div>
  );
}

export default App;
