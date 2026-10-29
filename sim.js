// Fake sensor feed. Used by server.js (Node) and by index.html (browser fallback).
(function (root) {
  const r = (a, b) => a + Math.random() * (b - a);
  const walk = (v, a, b, s) => Math.min(b, Math.max(a, v + (Math.random() - 0.5) * s));
  const f1 = (v) => Math.round(v * 10) / 10;
  const ETYPES = ['FIRE', 'MEDICAL', 'TRAFFIC_ACCIDENT', 'POWER_OUTAGE'];
  const S = { speed: 35, veh: 60, pm25: 60, temp: 31, hum: 65, rain: 0, wind: 8, occ: 28, inc: 1,
              etype: 'FIRE', lights: [1, 1, 1, 1, 1, 1, 1, 1] };

  function tick() {
    S.speed = walk(S.speed, 8, 60, 8);
    S.veh = walk(S.veh, 10, 120, 14);
    S.pm25 = walk(S.pm25, 15, 150, 10);
    S.temp = walk(S.temp, 24, 38, 0.8);
    S.hum = walk(S.hum, 40, 95, 3);
    S.wind = walk(S.wind, 0, 25, 2);
    if (Math.random() < 0.04) S.rain = S.rain > 0 ? 0 : r(2, 10);
    S.occ = Math.round(walk(S.occ, 8, 48, 4));
    S.inc = Math.round(walk(S.inc, 0, 5, 1.6));
    if (Math.random() < 0.1) S.etype = ETYPES[Math.floor(Math.random() * ETYPES.length)];
    S.lights = S.lights.map((l) => (l ? (Math.random() < 0.03 ? 0 : 1) : (Math.random() < 0.2 ? 1 : 0)));

    const speed = Math.round(S.speed);
    const aqi = Math.round(S.pm25 * 1.8 + 10);
    const on = S.lights.reduce((a, b) => a + b, 0);
    return {
      timestamp: new Date().toISOString(),
      traffic: { sensor_id: 'TRF-ERD-001', avg_speed_kmph: speed, vehicle_count: Math.round(S.veh),
        congestion_level: speed < 20 ? 'HIGH' : speed < 40 ? 'MEDIUM' : 'LOW' },
      streetlights: { total: 8, lights_on: on, lights_faulty: 8 - on, power_watts: on * 45, lights: S.lights.slice() },
      weather: { station_id: 'WST-ERD-001', temperature_c: f1(S.temp), humidity_pct: Math.round(S.hum),
        rainfall_mm: f1(S.rain), wind_speed_kmph: f1(S.wind) },
      air: { monitor_id: 'AQM-ERD-001', pm25: f1(S.pm25), pm10: f1(S.pm25 * 1.6), co_ppm: f1(S.pm25 / 60), aqi,
        aqi_category: aqi <= 50 ? 'GOOD' : aqi <= 100 ? 'MODERATE' : aqi <= 150 ? 'UNHEALTHY_SENSITIVE' : aqi <= 200 ? 'UNHEALTHY' : 'VERY_UNHEALTHY' },
      parking: { lot_id: 'PKG-ERD-001', total_slots: 48, occupied_slots: S.occ, free_slots: 48 - S.occ,
        occupancy_pct: f1((S.occ * 100) / 48) },
      emergency: { open_incidents: S.inc, severity: S.inc === 0 ? 'NONE' : S.inc <= 1 ? 'LOW' : S.inc <= 3 ? 'MEDIUM' : 'HIGH',
        type: S.inc === 0 ? '-' : S.etype, status: S.inc === 0 ? 'ALL_CLEAR' : 'DISPATCHED' },
    };
  }
  root.simTick = tick;
  if (typeof module !== 'undefined') module.exports = { tick };
})(typeof window !== 'undefined' ? window : globalThis);
