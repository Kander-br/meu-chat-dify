// Arquivo: api/chat.js (VERSÃO FINAL E CORRETA)

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const body = await request.json();
  const { type } = body;

  let difyEndpoint = '';
  let DIFY_API_KEY = '';
  let difyPayload = {};

  if (type === 'generate_map') {
    difyEndpoint = 'https://api.dify.ai/v1/workflows/run';
    DIFY_API_KEY = process.env.DIFY_GENERATOR_KEY;
    difyPayload = {
      inputs: body.inputs,
      response_mode: 'streaming', // A chave é tratar TUDO como streaming
      user: 'user-final-run'
    };
  } else if (type === 'chat_message') {
    difyEndpoint = 'https://api.dify.ai/v1/chat-messages';
    DIFY_API_KEY = process.env.DIFY_CHAT_KEY;
    difyPayload = {
      inputs: body.inputs,
      query: body.query,
      conversation_id: body.conversation_id,
      response_mode: 'streaming',
      user: 'user-final-run'
    };
  } else {
    return new Response(JSON.stringify({ error: 'Tipo de requisição inválida' }), { status: 400 });
  }

  try {
    const difyResponse = await fetch(difyEndpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${DIFY_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(difyPayload)
    });

    // Simplesmente repassa a resposta em stream do Dify para o frontend
    return new Response(difyResponse.body, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    console.error('BACKEND ERROR:', error);
    return new Response(JSON.stringify({ error: 'Falha na comunicação com o Dify' }), { status: 500 });
  }
}
