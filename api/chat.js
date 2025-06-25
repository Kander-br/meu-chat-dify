// Arquivo: api/chat.js (VERSÃO FINAL COM ENDPOINT DE WORKFLOW CORRETO)

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
    // MUDANÇA 1: USANDO O ENDPOINT CORRETO PARA WORKFLOWS
    // =======================================================
    const difyEndpoint = 'https://api.dify.ai/v1/workflows/run';

    const difyPayload = {
      inputs,
      response_mode: 'blocking', // A resposta virá completa
      user: 'user-workflow-runner'
    };

    try {
      const difyResponse = await fetch(difyEndpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${DIFY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(difyPayload)
      });
      
      const data = await difyResponse.json();

      // Log para vermos a resposta exata do Dify
      console.log('WORKFLOW RESPONSE:', JSON.stringify(data, null, 2));

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      console.error('BACKEND WORKFLOW ERROR:', error);
      return new Response(JSON.stringify({ error: 'Falha ao executar workflow no Dify' }), { status: 500 });
    }
    
  } else if (type === 'chat_message') {
    // A lógica do chat (App 2) já está correta e não precisa mudar.
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
