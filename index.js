const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const axios = require('axios');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

app.post('/proxy-token', async (req, res) => {
  const timestamp = Date.now();
  const password = `${client_id}_${timestamp}`;
  try {
    const hashed = await bcrypt.hash(password, client_secret);
    const client_secret_sign = Buffer.from(hashed).toString('base64');

    const response = await axios.post(
      'https://api.commerce.naver.com/v1/oauth2/token',
      {
        client_id,
        timestamp,
        client_secret_sign,
        grant_type: 'client_credentials',
        type: 'SELF'
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    res
      .status(err.response?.status || 500)
      .json({ error: err.response?.data || err.message });
  }
});

app.get('/my-ip', async (req, res) => {
  try {
    const ip = await axios.get('https://api64.ipify.org?format=json');
    res.json(ip.data);
  } catch (err) {
    res.status(500).json({ error: 'IP 조회 실패' });
  }
});

app.get('/', (req, res) => {
  res.send('Naver Auth API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});