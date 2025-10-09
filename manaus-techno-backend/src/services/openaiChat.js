// src/services/openaiChat.js
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o-mini';

async function explainAndMessage({ vaga, freel, matchPercent, perspective = 'vaga->freelancer' }) {
  const system = `
Você é um assistente de recrutamento.
Escreva respostas curtas (2-4 linhas), objetivas, sem bajulação.
No máximo 4 habilidades citadas. Não invente informações.
  `.trim();

  const user = `
[Match] ${matchPercent}%

[Vaga]
Título: ${vaga?.titulo || '—'}
Área: ${vaga?.area_atuacao || '—'}
Nível: ${vaga?.nivel_experiencia || '—'}
Modalidade: ${vaga?.modalidade_trabalho || '—'}
Contrato: ${vaga?.tipo_contrato || '—'}
Skills obrigatórias: ${Array.isArray(vaga?.skills_obrigatorias) ? vaga.skills_obrigatorias.join(', ') : vaga?.skills_obrigatorias || '—'}
Skills desejáveis: ${Array.isArray(vaga?.skills_desejaveis) ? vaga.skills_desejaveis.join(', ') : vaga?.skills_desejaveis || '—'}
Descrição: ${vaga?.descricao_geral?.slice(0, 600) || '—'}

[Freelancer]
Nome: ${freel?.nome || '—'}
Área: ${freel?.area_atuacao || '—'}
Nível: ${freel?.nivel_experiencia || '—'}
Modalidade preferida: ${freel?.modalidade_trabalho || '—'}
Disponibilidade: ${freel?.disponibilidade || '—'}
Skills: ${Array.isArray(freel?.skills_array) ? freel.skills_array.join(', ') : freel?.skills_array || '—'}
Principais: ${freel?.principais_habilidades || '—'}
Resumo: ${freel?.resumo_profissional?.slice(0, 600) || '—'}

[Saída JSON]
{
  "short_reason": "por que combina (2-4 linhas, até 4 pontos)",
  "personal_message": "mensagem curta (2-4 linhas) para ${perspective === 'vaga->freelancer' ? 'convidar o freelancer' : 'apresentar-se à empresa'}"
}
  `.trim();

  const resp = await client.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.3,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    response_format: { type: 'json_object' },
  });

  let out = { short_reason: '', personal_message: '' };
  try { out = JSON.parse(resp.choices?.[0]?.message?.content || '{}'); } catch {}
  return {
    short_reason: String(out.short_reason || '').slice(0, 600),
    personal_message: String(out.personal_message || '').slice(0, 600),
  };
}

module.exports = { explainAndMessage, CHAT_MODEL };
