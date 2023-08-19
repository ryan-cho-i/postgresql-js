const ExcelJS = require("exceljs");

async function readXLSX(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];
  const data = [];

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const rowData = row.values;
    data.push(rowData.slice(1));
  });

  return data;
}

const main = async () => {
  try {
    const filePath = "./example.xlsx";
    const xlsxData = await readXLSX(filePath);
    console.log(xlsxData);
  } catch (err) {
    console.log(err);
  }
};

main();
