// Arquivo: api/chat.js (VERSÃO FINAL COM CORREÇÃO DE ENDPOINT)

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const body = await request.json();
  const { type } = body;

  if (type === 'generate_map') {
    const { inputs } = body;
    const DIFY_API_KEY = process.env.DIFY_GENERATOR_KEY;

    // =======================================================
    // MUDANÇA 1: A URL DA API
    // Trocamos '/completion-messages' por '/chat-messages'
    // =======================================================
    const difyEndpoint = 'https://api.dify.ai/v1/chat-messages';

    // =======================================================
    // MUDANÇA 2: O CONTEÚDO DA MENSAGEM
    // O endpoint de chat precisa de um 'query', mesmo que seja genérico.
    // =======================================================
    const difyPayload = {
      inputs,
      query: 'Gerar o mapa de oportunidades inicial.', // Pergunta genérica para iniciar o workflow
      response_mode: 'blocking',
      user: 'user-map-generator-final'
    };

    try {
      const difyResponse = await fetch(difyEndpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${DIFY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(difyPayload)
      });

      const data = await difyResponse.json();

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      console.error('BACKEND ERROR:', error);
      return new Response(JSON.stringify({ error: 'Falha ao gerar mapa no Dify' }), { status: 500 });
    }

  } else if (type === 'chat_message') {
    // Esta parte já estava correta e não muda.
    const { inputs, query, conversation_id } = body;
    const DIFY_API_KEY = process.env.DIFY_CHAT_KEY;
    try {
      const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${DIFY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, query, conversation_id, response_mode: 'streaming', user: 'user-chat-assistant' })
      });
      return new Response(difyResponse.body, { status: 200, headers: { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' }});
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Falha ao conversar com Dify' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: 'Tipo de requisição inválida' }), { status: 400 });
}
