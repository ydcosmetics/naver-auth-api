const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');

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

    const data = qs.stringify({
      type: 'SELF',
      grant_type: 'client_credentials',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      client_secret_sign: client_secret_sign,
    });

    const config = {
      method: 'post',
      url: 'https://api.commerce.naver.com/external/v1/oauth2/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      data: data,
      maxBodyLength: Infinity,
    };

    const response = await axios.request(config);
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      message: 'Error requesting token',
      error: err.response?.data || err.message,
    });
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