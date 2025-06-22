const express = require("express");
const axios = require("axios");
const cors = require("cors");
const https = require("https");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

const API_KEY = process.env.TMDB_API_KEY;

app.get("/api/movies", async (req, res) => {
  const query = req.query.query;

  const tmdbUrl = query
    ? `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}`
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
    console.error(error);
    res.status(500).json({ error: "TMDb fetch failed" });
  }
});


app.get(/^\/api\/image\/(.+)$/, (req, res) => {
  const posterpath = req.params[0]; // the captured filename

  if (!posterpath) {
    return res.status(400).send("Missing image poster path");
  }

  const imageUrl = `https://image.tmdb.org/t/p/w500/${posterpath}`;
  https.get(imageUrl, (imageRes) => {
    res.setHeader("Content-Type", imageRes.headers["content-type"]);
    imageRes.pipe(res);
  }).on("error", (err) => {
    console.error("Image fetch failed:", err.message);
    res.status(500).send("Image fetch failed");
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});


// const PORT = process.env.PORT || 8080;
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Proxy server running at http://0.0.0.0:${PORT}`);
// });