const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ Only allow requests from your deployed frontend
const allowedOrigins = [
  "https://movienow-beta.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
}));


const API_KEY = process.env.TMDB_API_KEY;


if (!API_KEY) {
  console.warn("⚠️ TMDB_API_KEY is not set in .env!");
}

// ✅ Movie route (no API key check, no rate limit)
app.get("/api/movies", async (req, res) => {
  const query = req.query.query;

  const tmdbUrl = query
    ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`
    : `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc`;

  try {
    const response = await axios.get(tmdbUrl, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "TMDb fetch failed" });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});


