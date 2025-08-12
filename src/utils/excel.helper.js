const xlsx = require("xlsx"); 
const fs = require("fs");

function parseExcelFile(path) {
  const workbook = xlsx.readFile(path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet);
  fs.unlinkSync(path);

  const students = jsonData.map((row, index) => {
    const fullName = row["Full Name"];
    const parentName = row["Parent Name"];
    const parentPhone = row["Parent Phone"];
    const address = row["Address"];
    console.log('Dữ liệu từ file Excel:', jsonData);  
    console.log(`Row ${index + 2}:`, { fullName, parentName, parentPhone, address });

    if (!fullName || !parentName || !parentPhone || !address) {
      throw new Error(`❌ Missing data at row ${index + 2} in Excel file`);
    }

    return { fullName, parentName, parentPhone, address };
  });

  return students;
}

module.exports = { parseExcelFile };