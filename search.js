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
  .then(() => {
    console.log("Connected successfully");
    return client.query(
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
  })
  .then((results) => {
    console.log(results.rows);
  })
  .catch((e) => console.error(e))
  .finally(() => client.end());
