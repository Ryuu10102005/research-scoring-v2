const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {connectDB } = require('./db_connector');
const { calculateScore } = require('./calculator_logic');

const app = express();
const port = 5500;

app.use(bodyParser.json());
app.use(cors());

let pool;
(async () => {
  pool = await connectDB();
})();

app.get('/api/journals', async (req, res) => {
  try {
     const pool = await connectDB();
     const [rows] = await pool.query(`
      SELECT 
        journal_name AS name,
        'Unknown' AS category,
        'N/A' AS issn,
        0 AS sjr, 
        0 AS flagship
      FROM Journals
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Error loading journals:', err);
    res.status(500).json({ error: 'Không thể tải dữ liệu từ MySQL.' });
  }
});
app.post('/api/calculate', async (req, res) => {
  try {
    const {
      publisher,
      journal_name,
      sjr_percentile_p,
      cites_3_5y,
      role_weight,
      is_flagship 
    } = req.body;

    const result = calculateScore({
    sjr_percentile_p: parseFloat(sjr_percentile_p),
    cites_3_5y: parseFloat(cites_3_5y),
    role_weight: parseFloat(role_weight),
    is_flagship: Boolean(is_flagship)
});

    await pool.query(
      `INSERT INTO Papers 
       (publisher, journal_name, sjr_percentile_p, cites_3_5y, role_weight, 
        c95_tier_year, journal_base, journal_score, impact_score, paper_score, paper_score_adj)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        publisher,
        journal_name,
        sjr_percentile_p,
        cites_3_5y,
        role_weight,
        result.C95,
        result.JournalBase,
        result.JournalScore,
        result.ImpactScore,
        result.PaperScore,
        result.PaperScoreAdj
      ]
    );

    res.json({
      message: "✅ Tính toán thành công!",
      ...result
    });
  } catch (err) {
    console.error('❌ Lỗi /api/calculate:', err);
    res.status(500).json({ error: "Lỗi tính toán hoặc kết nối MySQL" });
  }
});

app.listen(port, () => {
  console.log(`✅ Backend Server đang chạy tại: http://localhost:${port}`);
});
