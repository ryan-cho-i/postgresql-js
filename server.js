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
  res.sendFile(path.join(__dirname, "main.html"));
});

app.get("/campaign1", (req, res) => {
  res.sendFile(path.join(__dirname, "detail1.html"));
});

app.get("/campaign2", (req, res) => {
  res.sendFile(path.join(__dirname, "detail2.html"));
});

const getQuery = (campaigns) => {
  const queries = campaigns.map(
    (campaign) =>
      `
    SELECT  
      '${campaign.name}' as name,
      sum(impressions) as total_impressions,
      sum(clicks) as total_clicks,
      round((sum(clicks)::numeric * 100 / sum(impressions)::numeric)::numeric(10,4), 3) as total_click_rate,
      sum(video_completions) as total_video_completions 
    FROM Campaigns 
    WHERE placement_id IN (${campaign.placementIds.join(", ")})
    `
  );

  return queries.join(` UNION `);
};

const getData = async (client, query) => {
  try {
    const result = await client.query(query);
    return result.rows;
  } catch (err) {
    throw err;
  }
};

app.get("/main", async (req, res) => {
  const query = getQuery([
    {
      name: "campaign1",
      placementIds: [356718122, 357061831, 372399902, 368895580],
    },
    {
      name: "campaign2",
      placementIds: [370466671, 370459330, 370433944],
    },
  ]);
  try {
    const data = await getData(client, query);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/detail/:campaign", async (req, res) => {
  const campaignValue = req.params.campaign;
  let query;
  if (campaignValue == "campaign1") {
    query = getQuery([
      {
        name: "356718122",
        placementIds: [356718122],
      },
      {
        name: "357061831",
        placementIds: [357061831],
      },
      {
        name: "372399902",
        placementIds: [372399902],
      },
      {
        name: "368895580",
        placementIds: [368895580],
      },
    ]);
  } else {
    query = getQuery([
      {
        name: "370466671",
        placementIds: [370466671],
      },

      {
        name: "370459330",
        placementIds: [370459330],
      },

      {
        name: "370433944",
        placementIds: [370433944],
      },
    ]);
  }
  try {
    const data = await getData(client, query);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/detail/placement/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await getData(
      client,
      `
    SELECT *
  FROM Campaigns 
  WHERE placement_id IN (${id})`
    );
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
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
