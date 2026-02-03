const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // IMPORTANT for auto location

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Manual city weather
app.post("/weather", async (req, res) => {
  try {
    const city = req.body.city;

    if (!city) {
      return res.render("result", { error: "Please enter a city name." });
    }

    const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
    const geoResponse = await axios.get(geoURL);

    if (!geoResponse.data.results) {
      return res.render("result", { error: "City not found." });
    }

    const { latitude, longitude } = geoResponse.data.results[0];

    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_probability_max,temperature_2m_max&timezone=auto`;

    const weatherResponse = await axios.get(weatherURL);

    res.render("result", {
      city,
      rainChance: weatherResponse.data.daily.precipitation_probability_max[1],
      temp: weatherResponse.data.daily.temperature_2m_max[1],
      error: null
    });

  } catch (error) {
    console.log(error);
    res.render("result", { error: "Unable to fetch weather data." });
  }
});

// Auto-detect location weather (POST)
app.post("/auto-weather", async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      return res.render("result", {
        error: "Location not received."
      });
    }

    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_probability_max,temperature_2m_max&timezone=auto`;

    const response = await axios.get(weatherURL);

    res.render("result", {
      city: "Your Location",
      rainChance: response.data.daily.precipitation_probability_max[1],
      temp: response.data.daily.temperature_2m_max[1],
      error: null
    });

  } catch (error) {
    console.log(error);
    res.render("result", {
      error: "Unable to fetch weather for your location."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
