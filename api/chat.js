// Arquivo: api/chat.js (Versão ATUALIZADA com CORS)
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Se a requisição for um 'OPTIONS' (pre-flight check do CORS), apenas retorne OK.
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*', // Permite qualquer origem
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Pega os dados enviados pelo seu formulário
  const { inputs, query, conversation_id } = await request.json();
  const DIFY_API_KEY = process.env.DIFY_API_KEY;

  try {
    const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputs || {},
        query: query,
        user: 'local-test-user',
        response_mode: 'streaming',
        conversation_id: conversation_id || '',
      }),
    });

    // Retorna a resposta do Dify com as permissões CORS
    return new Response(difyResponse.body, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Permite que seu localhost acesse
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to connect to Dify API' }), { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
}
