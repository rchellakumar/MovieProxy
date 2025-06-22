const express = require("express");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*" }));

//  Load API keys from .env
const validAPIKeys = process.env.VALID_API_KEYS
  ? process.env.VALID_API_KEYS.split(",")
  : [];

//  Middleware to check API key
const apiKeyAuth = (req, res, next) => {
  const userKey = req.header("x-api-key") || req.query.api_key;
  if (!userKey) return res.status(401).json({ error: "API key required" });
  if (!validAPIKeys.includes(userKey)) return res.status(403).json({ error: "Invalid API key" });
  next();
};

//  Rate limiting (per IP address)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per window per IP
  message: { error: "Too many requests. Please try again later." },
});
app.use(limiter); // apply to all routes

const API_KEY = process.env.TMDB_API_KEY;

//  Movies endpoint
app.get("/api/movies", apiKeyAuth, async (req, res) => {
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

//  Image proxy endpoint
app.get(/^\/api\/image\/(.+)$/, apiKeyAuth, (req, res) => {
  const posterpath = req.params[0];

  if (!posterpath) return res.status(400).send("Missing image poster path");

  const imageUrl = `https://image.tmdb.org/t/p/w500/${posterpath}`;
  https
    .get(imageUrl, (imageRes) => {
      res.setHeader("Content-Type", imageRes.headers["content-type"]);
      imageRes.pipe(res);
    })
    .on("error", (err) => {
      console.error("Image fetch failed:", err.message);
      res.status(500).send("Image fetch failed");
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
