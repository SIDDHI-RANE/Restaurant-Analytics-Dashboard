// backend/utils.js

// ---- Simple in-memory cache ----
const cache = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30s TTL

export function cacheGet(key) {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() - v.ts > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return v.val;
}

export function cacheSet(key, val) {
  cache.set(key, { val, ts: Date.now() });
}

// ---- Query param parser ----
export function parseQueryParams(qs) {
  return {
    restaurant_ids: qs.restaurant_id
      ? qs.restaurant_id.split(",").map(Number)
      : null,
    start_date: qs.start_date ? new Date(qs.start_date) : null,
    end_date: qs.end_date ? new Date(qs.end_date) : null,
    min_amount: qs.min_amount ? Number(qs.min_amount) : null,
    max_amount: qs.max_amount ? Number(qs.max_amount) : null,
    start_hour: qs.start_hour != null ? Number(qs.start_hour) : null,
    end_hour: qs.end_hour != null ? Number(qs.end_hour) : null,
  };
}

// ---- Order filtering ----
export function filterOrders(allOrders, params) {
  return allOrders.filter((o) => {
    const t = new Date(o.order_time);

    if (params.restaurant_ids && !params.restaurant_ids.includes(o.restaurant_id)) {
      return false;
    }
    if (params.start_date && t < new Date(params.start_date.toDateString())) {
      return false;
    }
    if (params.end_date && t > new Date(params.end_date.toDateString() + " 23:59:59")) {
      return false;
    }
    if (params.min_amount != null && o.order_amount < params.min_amount) {
      return false;
    }
    if (params.max_amount != null && o.order_amount > params.max_amount) {
      return false;
    }
    if (params.start_hour != null || params.end_hour != null) {
      const h = t.getHours();
      if (params.start_hour != null && h < params.start_hour) return false;
      if (params.end_hour != null && h > params.end_hour) return false;
    }

    return true;
  });
}

// ---- Aggregation helpers ----
export function groupOrdersByDay(orders) {
  const dayMap = new Map();

  orders.forEach((o) => {
    const day = new Date(o.order_time).toISOString().slice(0, 10);
    if (!dayMap.has(day)) dayMap.set(day, { orders: [], revenue: 0 });
    const entry = dayMap.get(day);
    entry.orders.push(o);
    entry.revenue += o.order_amount;
  });

  return Array.from(dayMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, obj]) => {
      const hourCounts = {};
      obj.orders.forEach((o) => {
        const h = new Date(o.order_time).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      });
      const peakHour = Object.keys(hourCounts).length
        ? Number(
            Object.keys(hourCounts).reduce((a, b) =>
              hourCounts[a] >= hourCounts[b] ? a : b
            )
          )
        : null;

      return {
        day,
        orders_count: obj.orders.length,
        revenue: obj.revenue,
        avg_order_value: obj.orders.length
          ? +(obj.revenue / obj.orders.length).toFixed(2)
          : 0,
        peak_hour: peakHour,
      };
    });
}
