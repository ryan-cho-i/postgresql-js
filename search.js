const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "dashboard",
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

client
  .connect()
  .then(() => {
    console.log("Connected successfully");
    return client.query(
      `
      SELECT *
    FROM Campaigns 
    WHERE placement_id IN (356718122)`
    );
  })
  .then((results) => {
    console.log(results.rows);
  })
  .catch((e) => console.error(e))
  .finally(() => client.end());
