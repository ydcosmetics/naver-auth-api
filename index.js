const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

app.post('/get-naver-sign', async (req, res) => {
  const timestamp = Date.now();
  const password = `${client_id}_${timestamp}`;

  try {
    const hashed = await bcrypt.hash(password, client_secret);
    const encoded = Buffer.from(hashed).toString('base64');

    res.json({
      client_id,
      timestamp,
      client_secret_sign: encoded
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Naver Auth API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});