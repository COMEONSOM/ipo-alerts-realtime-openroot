// =====================================================
// 🚀 INDIAN IPO TRACKER PROXY SERVER (NSE INDIA API)
// BUILT BY SOMU 💜 — OCT 2025 EDITION (SMART FALLBACK)
// =====================================================

import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Helper function to fetch NSE data safely
async function fetchNSE(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Referer": "https://www.nseindia.com/",
      "Connection": "keep-alive",
      "DNT": "1",
    },
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.warn("⚠️ NSE returned non-JSON response:", text.slice(0, 200));
    return null;
  }
}

// ✅ Main API route with fallback logic
app.get("/api/ipo", async (req, res) => {
  try {
    let data = await fetchNSE("https://www.nseindia.com/api/latest-ipo");

    if (!data || !data.data || data.data.length === 0) {
      console.log("🔁 Falling back to /api/ipo-track-records...");
      data = await fetchNSE("https://www.nseindia.com/api/ipo-track-records");
    }

    if (!data) {
      return res.status(500).json({ error: "No valid data from NSE." });
    }

    res.json(data);
  } catch (err) {
    console.error("❌ Proxy Error:", err);
    res.status(500).json({ error: "Internal proxy error." });
  }
});

// ✅ Catch-all route to serve frontend (fixes 404)
app.get((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start the server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
