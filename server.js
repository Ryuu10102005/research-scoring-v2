const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { calculateScore } = require('./calculator_logic');

const app = express();
const port = process.env.PORT || 5500;

app.use(bodyParser.json());
app.use(cors());
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
    res.json({
      message: "✅ Tính toán thành công!",
      ...result
    });
  } catch (err) {
    console.error('❌ Lỗi /api/calculate:', err);
    res.status(500).json({ error: "Lỗi tính toán hoặc kết nối MySQL" });
  }
});
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(port, () => {
  console.log(`✅ Backend Server đang chạy tại: http://localhost:${port}`);
});
