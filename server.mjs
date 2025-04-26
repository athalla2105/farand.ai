import express from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Memuat variabel lingkungan dari file .env

const app = express();
app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ API Key tidak ditemukan. Pastikan file .env berisi OPENAI_API_KEY.');
  process.exit(1); // Hentikan server jika API Key tidak ditemukan
}

console.log('✅ API Key ditemukan:', apiKey ? 'Tersedia' : 'Tidak tersedia'); // Log status API Key

// --- ROUTE API DULU ---
app.post('/api/chat', async (req, res) => {
  try {
    // Validasi request body
    if (!req.body || !req.body.model || !req.body.messages) {
      return res.status(400).json({ error: 'Request body tidak valid. Pastikan berisi model dan messages.' });
    }

    console.log('📥 Incoming request body:', req.body); // Log request dari frontend

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    console.log('📤 Response status:', response.status); // Log status respons

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      const text = await response.text();
      console.error('❌ Response bukan JSON:', text);
      return res.status(500).json({ error: 'Response dari OpenAI bukan JSON', detail: text });
    }

    if (!response.ok) {
      console.error('❌ OpenAI API error:', data); // Log error dari OpenAI
      return res.status(response.status).json({ error: data.error || 'OpenAI API error' });
    }

    console.log('✅ OpenAI API response:', data); // Log respons dari OpenAI
    res.json(data);
  } catch (err) {
    console.error('❌ Server error:', err); // Log error server
    res.status(500).json({ error: 'Internal Server Error', detail: err.message });
  }
});

// --- STATIC SETELAH API ---
app.use(express.static('public'));

app.listen(3000, () => console.log('✅ Server running at http://localhost:3000'));

