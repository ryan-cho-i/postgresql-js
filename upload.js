const { Client } = require("pg");
const ExcelJS = require("exceljs");

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

async function insertToDatabase(data) {
  const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "dashboard",
    password: "postgres",
    port: 5432,
  });

  try {
    await client.connect();
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
  } finally {
    await client.end();
  }
}

const main = async () => {
  try {
    const filePath = "./example.xlsx";
    const xlsxData = await readXLSX(filePath);
    xlsxData.pop();
    await insertToDatabase(xlsxData);
  } catch (err) {
    console.log(err);
  }
};

main();
