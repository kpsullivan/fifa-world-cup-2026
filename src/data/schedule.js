// 2026 FIFA World Cup Schedule — Group Stage
// All times in ET (Eastern Time)
// Tournament runs June 11 – July 19, 2026

export const matches = [
  // === JUNE 11 ===
  { id: 1, date: "2026-06-11", time: "17:00", home: "MEX", away: "ECU", venue: "SoFi Stadium", city: "Los Angeles", group: "E", homeScore: 2, awayScore: 0, status: "FT" },
  { id: 2, date: "2026-06-11", time: "20:00", home: "USA", away: "CAN", venue: "MetLife Stadium", city: "East Rutherford, NJ", group: "A", homeScore: 3, awayScore: 1, status: "FT" },

  // === JUNE 12 ===
  { id: 3, date: "2026-06-12", time: "14:00", home: "ARG", away: "CRO", venue: "Hard Rock Stadium", city: "Miami", group: "B", homeScore: 1, awayScore: 0, status: "FT" },
  { id: 4, date: "2026-06-12", time: "17:00", home: "ESP", away: "MAR", venue: "AT&T Stadium", city: "Dallas", group: "B", homeScore: 2, awayScore: 1, status: "FT" },
  { id: 5, date: "2026-06-12", time: "20:00", home: "BRA", away: "BEL", venue: "Levi's Stadium", city: "San Francisco", group: "C", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 13 ===
  { id: 6, date: "2026-06-13", time: "14:00", home: "FRA", away: "JPN", venue: "MetLife Stadium", city: "East Rutherford, NJ", group: "C", homeScore: null, awayScore: null, status: "NS" },
  { id: 7, date: "2026-06-13", time: "17:00", home: "ENG", away: "SEN", venue: "SoFi Stadium", city: "Los Angeles", group: "D", homeScore: null, awayScore: null, status: "NS" },
  { id: 8, date: "2026-06-13", time: "20:00", home: "GER", away: "POR", venue: "Rose Bowl", city: "Pasadena, CA", group: "D", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 14 ===
  { id: 9, date: "2026-06-14", time: "14:00", home: "NED", away: "KOR", venue: "AT&T Stadium", city: "Dallas", group: "G", homeScore: null, awayScore: null, status: "NS" },
  { id: 10, date: "2026-06-14", time: "17:00", home: "URU", away: "CMR", venue: "Hard Rock Stadium", city: "Miami", group: "A", homeScore: null, awayScore: null, status: "NS" },
  { id: 11, date: "2026-06-14", time: "20:00", home: "ITA", away: "COL", venue: "Gillette Stadium", city: "Foxborough, MA", group: "F", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 15 (TODAY) ===
  { id: 12, date: "2026-06-15", time: "12:00", home: "NGR", away: "SRB", venue: "Lincoln Financial Field", city: "Philadelphia", group: "H", homeScore: null, awayScore: null, status: "LIVE", minute: 23 },
  { id: 13, date: "2026-06-15", time: "15:00", home: "AUS", away: "ECU", venue: "Levi's Stadium", city: "San Francisco", group: "G", homeScore: null, awayScore: null, status: "NS" },
  { id: 14, date: "2026-06-15", time: "18:00", home: "MAR", away: "CRO", venue: "MetLife Stadium", city: "East Rutherford, NJ", group: "B", homeScore: null, awayScore: null, status: "NS" },
  { id: 15, date: "2026-06-15", time: "21:00", home: "CAN", away: "URU", venue: "SoFi Stadium", city: "Los Angeles", group: "A", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 16 ===
  { id: 16, date: "2026-06-16", time: "15:00", home: "BEL", away: "JPN", venue: "AT&T Stadium", city: "Dallas", group: "C", homeScore: null, awayScore: null, status: "NS" },
  { id: 17, date: "2026-06-16", time: "18:00", home: "SEN", away: "GER", venue: "Rose Bowl", city: "Pasadena, CA", group: "D", homeScore: null, awayScore: null, status: "NS" },
  { id: 18, date: "2026-06-16", time: "21:00", home: "COL", away: "NGR", venue: "Hard Rock Stadium", city: "Miami", group: "F", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 17 ===
  { id: 19, date: "2026-06-17", time: "15:00", home: "POR", away: "SEN", venue: "Gillette Stadium", city: "Foxborough, MA", group: "D", homeScore: null, awayScore: null, status: "NS" },
  { id: 20, date: "2026-06-17", time: "18:00", home: "KOR", away: "CMR", venue: "Lincoln Financial Field", city: "Philadelphia", group: "G", homeScore: null, awayScore: null, status: "NS" },
  { id: 21, date: "2026-06-17", time: "21:00", home: "SRB", away: "ITA", venue: "MetLife Stadium", city: "East Rutherford, NJ", group: "H", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 18 ===
  { id: 22, date: "2026-06-18", time: "12:00", home: "ARG", away: "MAR", venue: "AT&T Stadium", city: "Dallas", group: "B", homeScore: null, awayScore: null, status: "NS" },
  { id: 23, date: "2026-06-18", time: "15:00", home: "USA", away: "URU", venue: "SoFi Stadium", city: "Los Angeles", group: "A", homeScore: null, awayScore: null, status: "NS" },
  { id: 24, date: "2026-06-18", time: "18:00", home: "NED", away: "AUS", venue: "Rose Bowl", city: "Pasadena, CA", group: "G", homeScore: null, awayScore: null, status: "NS" },
  { id: 25, date: "2026-06-18", time: "21:00", home: "BRA", away: "JPN", venue: "Hard Rock Stadium", city: "Miami", group: "C", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 19 ===
  { id: 26, date: "2026-06-19", time: "15:00", home: "FRA", away: "BEL", venue: "Levi's Stadium", city: "San Francisco", group: "C", homeScore: null, awayScore: null, status: "NS" },
  { id: 27, date: "2026-06-19", time: "18:00", home: "ITA", away: "NGR", venue: "MetLife Stadium", city: "East Rutherford, NJ", group: "F", homeScore: null, awayScore: null, status: "NS" },
  { id: 28, date: "2026-06-19", time: "21:00", home: "ESP", away: "CRO", venue: "AT&T Stadium", city: "Dallas", group: "B", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 20 ===
  { id: 29, date: "2026-06-20", time: "15:00", home: "CAN", away: "MEX", venue: "SoFi Stadium", city: "Los Angeles", group: "A", homeScore: null, awayScore: null, status: "NS" },
  { id: 30, date: "2026-06-20", time: "18:00", home: "ENG", away: "GER", venue: "Rose Bowl", city: "Pasadena, CA", group: "D", homeScore: null, awayScore: null, status: "NS" },
  { id: 31, date: "2026-06-20", time: "21:00", home: "KOR", away: "ECU", venue: "Hard Rock Stadium", city: "Miami", group: "E", homeScore: null, awayScore: null, status: "NS" },

  // === JUNE 21 ===
  { id: 32, date: "2026-06-21", time: "15:00", home: "COL", away: "SRB", venue: "Gillette Stadium", city: "Foxborough, MA", group: "H", homeScore: null, awayScore: null, status: "NS" },
  { id: 33, date: "2026-06-21", time: "18:00", home: "CMR", away: "AUS", venue: "AT&T Stadium", city: "Dallas", group: "G", homeScore: null, awayScore: null, status: "NS" },
  { id: 34, date: "2026-06-21", time: "21:00", home: "POR", away: "ENG", venue: "MetLife Stadium", city: "East Rutherford, NJ", group: "D", homeScore: null, awayScore: null, status: "NS" },
];

export const getMatchesByDate = (dateStr) =>
  matches.filter(m => m.date === dateStr);

export const getTodayMatches = () => {
  const today = new Date().toISOString().split("T")[0];
  return matches.filter(m => m.date === today);
};
