// src/services/openaiEmbeddings.js
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

/**
 * Gera embedding 1536-dim para um texto.
 * Retorna array de floats.
 */
async function embedText(text) {
  const input = (text || '').toString().slice(0, 8000); // guarda um limite seguro
  if (!input.trim()) return null;

  const resp = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input
  });

  return resp.data?.[0]?.embedding || null;
}

module.exports = { embedText, EMBEDDING_MODEL };
