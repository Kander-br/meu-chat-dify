// Arquivo: api/chat.js (VERSÃO FINAL E INTELIGENTE)

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // O navegador envia uma requisição "de aquecimento" (OPTIONS) primeiro.
  // Esta resposta dá a permissão CORS para seu site conversar com este backend.
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // Em produção, troque '*' pelo seu domínio real
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Lê os dados que o seu site (index.html) enviou
  const body = await request.json();
  const { type } = body; // Pega o "tipo" de requisição: 'generate_map' ou 'chat_message'

  // =======================================================
  // LÓGICA DO "GERENTE DE TRÁFEGO"
  // =======================================================

  if (type === 'generate_map') {
    // --- Rota para Gerar o Mapa ---
    const { inputs } = body;
    const DIFY_API_KEY = process.env.DIFY_GENERATOR_KEY; // Usa a chave do Gerador

    try {
      const difyResponse = await fetch('https://api.dify.ai/v1/completion-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs,
          response_mode: 'blocking', // Espera a resposta completa
          user: 'user-map-generator'
        })
      });

      const data = await difyResponse.json();

      // Retorna a resposta completa (o mapa) como um JSON para o seu site
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Falha ao gerar mapa no Dify' }), { status: 500 });
    }

  } else if (type === 'chat_message') {
    // --- Rota para a Conversa do Chat ---
    const { inputs, query, conversation_id } = body;
    const DIFY_API_KEY = process.env.DIFY_CHAT_KEY; // Usa a chave do Chat

    try {
      const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs,
          query,
          conversation_id,
          response_mode: 'streaming', // Resposta em tempo real
          user: 'user-chat-assistant'
        })
      });

      // Retorna a resposta em streaming diretamente para o seu site
      return new Response(difyResponse.body, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: 'Falha ao conversar com Dify' }), { status: 500 });
    }
  }

  // Se o "type" não for reconhecido, retorna um erro.
  return new Response(JSON.stringify({ error: 'Tipo de requisição inválida' }), { status: 400 });
}
