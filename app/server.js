const express = require("express");
const path = require("path");
const app = express();
const { Pool } = require("pg");
const ExcelJS = require("exceljs");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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

app.get("/", (req, res) => {
  res.render("main");
});

app.get("/main/data", async (req, res) => {
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

app.get("/detail/:campaign", (req, res) => {
  const campaign = req.params.campaign;
  res.render("detail", { campaign: campaign });
});

app.get("/detail/:campaign/data", async (req, res) => {
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

async function readXLSX(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];

  const data = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      data.push(row.values.slice(1));
    }
  });
  return data;
}

async function createTable(client) {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS campaigns (
    Campaign TEXT,
    Placement TEXT,
    Placement_ID BIGINT,
    Date DATE,
    Impressions INTEGER,
    Clicks INTEGER,
    Click_Rate FLOAT,
    Video_Completions INTEGER
  );
  `;

  await client.query(createTableQuery);
  console.log("Table created successfully");
}

async function insertToDatabase(client, data) {
  try {
    await createTable(client);
    for (const item of data) {
      await client.query(
        "INSERT INTO campaigns (Campaign, Placement, Placement_ID, Date, Impressions, Clicks, Click_Rate, Video_Completions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        item
      );
    }
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

const pool = new Pool({
  host: "postgres",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "dashboard",
});

let client;

async function connectToDatabase() {
  while (!client) {
    try {
      client = await pool.connect();
      return client;
    } catch (err) {
      console.log(
        "Error connecting to PostgreSQL, retrying in 5 seconds:",
        err
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

const PORT = 8080;
app.listen(PORT, async () => {
  try {
    const client = await connectToDatabase();
    console.log("PostgreSQL Connected successfully");

    const filePath = path.join(__dirname, "example.xlsx");
    const xlsxData = await readXLSX(filePath);
    xlsxData.pop();
    await insertToDatabase(client, xlsxData);
    console.log("Upload data to PostgreSQL Database");

    console.log(`Server running at http://localhost:${PORT}/`);
  } catch (err) {
    console.log(err);
  }
});
