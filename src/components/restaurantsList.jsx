import { useState, useEffect } from "react";
import { fetchRestaurants } from "../api";

export default function RestaurantList({ onSelect }) {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRestaurants({ q: search }).then((res) => setRestaurants(res.data));
  }, [search]);

  return (
    <div style={{ padding: "10px" }}>
      <h3>Restaurants</h3>
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {restaurants.map((r) => (
          <li
            key={r.id}
            style={{
              padding: "8px",
              borderBottom: "1px solid #ddd",
              cursor: "pointer",
            }}
            onClick={() => onSelect(r)}
          >
            {r.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
