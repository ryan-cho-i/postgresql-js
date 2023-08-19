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
      "SELECT placement_id FROM Campaigns group by placement_id order by placement_id"
    );
  })
  .then((results) => {
    console.log(results.rows);
  })
  .catch((e) => console.error(e))
  .finally(() => client.end());
