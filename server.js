const express = require("express");
const path = require("path");
const app = express();

const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "dashboard",
});

client
  .connect()
  .then(() => console.log("PostgreSQL Connected successfully"))
  .catch((error) => console.error("Connection error", error));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client.html"));
});

app.get("/getData", async (req, res) => {
  try {
    const result = await client.query(
      `
      SELECT Campaign,
        sum(impressions) as total_impressions,
        sum(clicks) as total_clicks,
        round((sum(clicks)::numeric * 100 / sum(impressions)::numeric)::numeric(10,4), 3) as total_click_rate,
        sum(video_completions) as total_video_completions 
      FROM Campaigns 
      GROUP BY Campaign 
      ORDER BY Campaign
    `
    );
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Sending data to HTML failed");
  }
});

PORT = 8080;
app.listen(PORT, () => {
  try {
    console.log(`Server running at http://localhost:${PORT}/`);
  } catch (err) {
    console.log(err);
  }
});
