export default function PeakHourTable({ rows }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <h4>Peak Hours</h4>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Day</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Peak Hour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.day}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{r.day}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {r.peak_hour !== null ? `${r.peak_hour}:00` : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
