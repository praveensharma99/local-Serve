const express = require('express');
const cors = require('cors');

app.use('/uploads', express.static('uploads'));

require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/provider', require('./routes/providerRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'LocalServe Backend Chal Raha Hai!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server chal raha hai port ${PORT} pe`);
});