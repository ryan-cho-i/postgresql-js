const express = require("express");
const path = require("path");
const app = express();

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "client.html"));
});

app.get("/getData", async (req, res) => {
  res.json([
    { 이름: "홍길동", 나이: 25, 성별: "남성" },
    { 이름: "이순신", 나이: 35, 성별: "남성" },
    { 이름: "유관순", 나이: 20, 성별: "여성" },
  ]);
});

PORT = 8080;
app.listen(PORT, () => {
  try {
    console.log(`Server running at http://localhost:${PORT}/`);
  } catch (err) {
    console.log(err);
  }
});
