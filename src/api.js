// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api/";

// // ---- Restaurants ----
// export async function fetchRestaurants({ q, page = 1, limit = 10, sort }) {
//   const params = new URLSearchParams({ q, page, limit, sort });
//   const res = await fetch(`${API_BASE}/restaurants?${params.toString()}`);
//   return res.json();
// }

// // ---- Metrics ----
// export async function fetchMetrics(params) {
//   const qs = new URLSearchParams(params);
//   const res = await fetch(`${API_BASE}/metrics?${qs.toString()}`);
//   return res.json();
// }

// // ---- Top Restaurants ----
// export async function fetchTopRestaurants(params) {
//   const qs = new URLSearchParams(params);
//   const res = await fetch(`${API_BASE}/top-restaurants?${qs.toString()}`);
//   return res.json();
// }


const API_BASE = "http://localhost:4000/api";

export async function fetchRestaurants({ q, page = 1, limit = 10, sort }) {
  const params = new URLSearchParams({ q, page, limit, sort });
  const res = await fetch(`${API_BASE}/restaurants?` + params.toString());
  return res.json();
}

export async function fetchMetrics(params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/metrics?` + qs.toString());
  return res.json();
}

export async function fetchTopRestaurants(params) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${API_BASE}/top-restaurants?` + qs.toString());
  return res.json();
}
