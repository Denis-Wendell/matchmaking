// src/services/openaiEmbeddings.js
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-large';
const MAX_LEN = 8000;

async function embedText(text) {
  const input = (text || '').toString().slice(0, MAX_LEN).trim();
  if (!input) return null;

  // retry simples
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await client.embeddings.create({
        model: EMBEDDING_MODEL,
        input
      });
      return resp.data?.[0]?.embedding || null;
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise(r => setTimeout(r, 250 * attempt));
    }
  }
  return null;
}

module.exports = { embedText, EMBEDDING_MODEL };
