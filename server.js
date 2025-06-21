// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const API_KEY = process.env.TMDB_API_KEY;

app.get("/api/movies", async (req, res) => {
  try {
    const response = await axios.get("https://api.themoviedb.org/3/movie/popular", {
      params: {
        api_key: API_KEY,
        language: "en-US",
        page: req.query.page || 1,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "TMDb fetch failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
