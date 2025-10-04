// src/App.js
import React, { useEffect, useState, useRef } from "react";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc
} from "firebase/firestore";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
  MarkerClusterer
} from "@react-google-maps/api";

import "./App.css";

const COLLECTION = "sos_alerts";

function App() {
  const [alerts, setAlerts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [newAlertId, setNewAlertId] = useState(null);
  const prevAlertIds = useRef(new Set());

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // Real-time Firestore listener
  useEffect(() => {
    const q = query(collection(db, COLLECTION), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Detect newly added alerts
      const currentIds = new Set(list.map(a => a.id));
      list.forEach(alert => {
        if (!prevAlertIds.current.has(alert.id)) {
          setNewAlertId(alert.id); // highlight new alert
        }
      });
      prevAlertIds.current = currentIds;

      setAlerts(list);
    }, err => console.error("Firestore snapshot error:", err));

    return () => unsub();
  }, []);

  // Mark alert as resolved
  const markResolved = async (id) => {
    try {
      await updateDoc(doc(db, COLLECTION, id), { status: "resolved" });
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Map center
  const center = alerts.length
    ? { lat: alerts[0]?.location?.latitude || 20.0, lng: alerts[0]?.location?.longitude || 77.0 }
    : { lat: 20.5937, lng: 78.9629 };

  // Filtered and sorted alerts
  const filteredAlerts = alerts
    .filter(alert => filterStatus === "all" || alert.status === filterStatus)
    .sort((a, b) => (b.timestamp?.toDate?.() || 0) - (a.timestamp?.toDate?.() || 0));

  return (
    <div className="page">
      <div className="header">🚨 SOS Dashboard</div>
      <div className="main">

        {/* Left Panel - Map */}
        <div className="left">
          {!isLoaded ? <p>Loading map...</p> : (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={center}
              zoom={alerts.length ? 8 : 5}
            >
              <MarkerClusterer>
                {(clusterer) =>
                  alerts.map(alert => (
                    alert.location && (
                      <React.Fragment key={alert.id}>
                        <Marker
                          position={{ lat: alert.location.latitude, lng: alert.location.longitude }}
                          clusterer={clusterer}
                          icon={{
                            url: alert.status === "new"
                              ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                              : "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                          }}
                          onClick={() => setSelected(alert)}
                        />
                        {alert.accuracy && (
                          <Circle
                            center={{ lat: alert.location.latitude, lng: alert.location.longitude }}
                            radius={alert.accuracy}
                            options={{
                              fillColor: "#ff0000",
                              fillOpacity: 0.1,
                              strokeColor: "#ff0000",
                              strokeOpacity: 0.5,
                              strokeWeight: 1
                            }}
                          />
                        )}
                      </React.Fragment>
                    )
                  ))
                }
              </MarkerClusterer>

              {/* InfoWindow */}
              {selected && selected.location && (
                <InfoWindow
                  position={{ lat: selected.location.latitude, lng: selected.location.longitude }}
                  onCloseClick={() => setSelected(null)}
                >
                  <div style={{ maxWidth: 220 }}>
                    <h4>{selected.name || "Unknown"}</h4>
                    <p style={{ margin: 0 }}>{selected.message}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                      Status: {selected.status}<br/>
                      Time: {selected.timestamp?.toDate
                        ? selected.timestamp.toDate().toLocaleString()
                        : String(selected.timestamp)}<br/>
                      Device: {selected.device_info?.os} {selected.device_info?.model}<br/>
                      App Version: {selected.app_version}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>

        {/* Right Panel - Alert List */}
        <div className="right">
          <h3>Alerts ({alerts.length})</h3>

          {/* Filter */}
          <div className="filters">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select
              id="statusFilter"
              onChange={e => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="resolved">Resolved</option>
            </select>
            <br/>
            <small>Newest at top.</small>
          </div>

          {/* Alert List */}
          <div className="list">
            {filteredAlerts.map(alert => (
              <div
                className={`alert-card ${alert.status} ${alert.id === newAlertId ? "highlight-new" : ""}`}
                key={alert.id}
              >
                <div className="card-head">
                  <b>{alert.name || "Unknown"}</b>
                  <span className="time">
                    {alert.timestamp?.toDate?.()
                      ? alert.timestamp.toDate().toLocaleString()
                      : ""}
                  </span>
                </div>
                <p className="msg">{alert.message}</p>
                <p className="coords">
                  Lat: {alert.location?.latitude}, Lng: {alert.location?.longitude}
                </p>
                <div className="actions">
                  <button onClick={() => setSelected(alert)}>View on Map</button>
                  {alert.status !== "resolved" && (
                    <button className="resolve" onClick={() => markResolved(alert.id)}>Mark Resolved</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll to Top */}
          <button
            className="scroll-top"
            onClick={() => document.querySelector(".right").scrollTop = 0}
          >
            ⬆️ Top
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;



// import React, { useEffect, useState } from "react";
// import { initDb, getIssues, updateIssueStatus } from "./db";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import L from "leaflet";
// import "./App.css";

// // Custom icons for different issue statuses
// const redIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
//   iconSize: [32, 32],
// });

// const greenIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
//   iconSize: [32, 32],
// });

// const yellowIcon = new L.Icon({
//   iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
//   iconSize: [32, 32],
// });

// function App() {
//   const [issues, setIssues] = useState([]);

//   useEffect(() => {
//     async function load() {
//       await initDb();
//       setIssues(getIssues());
//     }
//     load();
//   }, []);

//   const handleResolve = (id) => {
//     updateIssueStatus(id, "resolved");
//     setIssues(getIssues());
//   };

//   const handleAcknowledge = (id) => {
//     updateIssueStatus(id, "unsolved");
//     setIssues(getIssues());
//   };

//   return (
//     <div className="dashboard">
//       <h1>🚨 Issues Dashboard</h1>

//       {/* MAP */}
//       <div className="map-container">
//         <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "400px", width: "100%", borderRadius: "12px" }}>
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution="&copy; OpenStreetMap contributors"
//           />
//           {issues.map(issue => (
//             <Marker
//               key={issue.id}
//               position={[issue.lat, issue.lng]}
//               icon={
//                 issue.status === "new"
//                   ? redIcon
//                   : issue.status === "resolved"
//                   ? greenIcon
//                   : yellowIcon
//               }
//             >
//               <Popup>
//                 <b>{issue.description}</b><br />
//                 📍 {issue.location}<br />
//                 👤 {issue.raised_by}<br />
//                 ⏰ {issue.timestamp}<br />
//                 <i>Status: {issue.status}</i><br />
//                 {issue.status === "new" && (
//                   <button onClick={() => handleAcknowledge(issue.id)}>Acknowledge</button>
//                 )}
//                 {issue.status !== "resolved" && (
//                   <button onClick={() => handleResolve(issue.id)}>Mark Resolved</button>
//                 )}
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       </div>

//       {/* TABLE */}
//       <table>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Description</th>
//             <th>Location</th>
//             <th>Raised By</th>
//             <th>Timestamp</th>
//             <th>Status</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {issues.map(issue => (
//             <tr key={issue.id}>
//               <td>{issue.id}</td>
//               <td>{issue.description}</td>
//               <td>{issue.location}</td>
//               <td>{issue.raised_by}</td>
//               <td>{issue.timestamp}</td>
//               <td>
//                 {issue.status === "new" ? (
//                   <span className="blinking-red">New</span>
//                 ) : issue.status === "resolved" ? (
//                   <span className="green">Resolved</span>
//                 ) : (
//                   <span className="yellow">Unsolved</span>
//                 )}
//               </td>
//               <td>
//                 {issue.status === "new" && (
//                   <button onClick={() => handleAcknowledge(issue.id)}>Acknowledge</button>
//                 )}
//                 {issue.status !== "resolved" && (
//                   <button onClick={() => handleResolve(issue.id)}>Mark Resolved</button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default App;




