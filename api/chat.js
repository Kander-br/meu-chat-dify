// Arquivo: api/chat.js (MODO DE DIAGNÓSTICO COMPLETO)

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const body = await request.json();
  // LOG 1: O que o backend recebeu do frontend?
  console.log('BACKEND LOG 1: Recebido do Frontend ->', JSON.stringify(body, null, 2));

  const { type } = body;

  if (type === 'generate_map') {
    const { inputs } = body;
    const DIFY_API_KEY = process.env.DIFY_GENERATOR_KEY;
    const difyPayload = {
      inputs,
      response_mode: 'blocking',
      user: 'user-map-generator-debug'
    };

    // LOG 2: O que o backend está enviando para o Dify?
    console.log('BACKEND LOG 2: Enviando para Dify ->', JSON.stringify(difyPayload, null, 2));

    try {
      const difyResponse = await fetch('https://api.dify.ai/v1/completion-messages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${DIFY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(difyPayload)
      });

      const responseBodyText = await difyResponse.text();
      // LOG 3: Qual foi a resposta EXATA (em texto) que o Dify retornou?
      console.log('BACKEND LOG 3: Resposta CRUA do Dify ->', responseBodyText);

      const data = JSON.parse(responseBodyText);
      // LOG 4: Como a resposta ficou depois de ser convertida para JSON?
      console.log('BACKEND LOG 4: Resposta do Dify como JSON ->', data);

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (error) {
      console.error('BACKEND ERROR: Falha na comunicação com Dify ->', error);
      return new Response(JSON.stringify({ error: 'Falha ao gerar mapa no Dify' }), { status: 500 });
    }

  } else if (type === 'chat_message') {
    // A lógica do chat permanece a mesma, pois já estava funcionando.
    const { inputs, query, conversation_id } = body;
    const DIFY_API_KEY = process.env.DIFY_CHAT_KEY;
    try {
      const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${DIFY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs, query, conversation_id, response_mode: 'streaming', user: 'user-chat-assistant-debug' })
      });
      return new Response(difyResponse.body, { status: 200, headers: { 'Content-Type': 'text/event-stream', 'Access-Control-Allow-Origin': '*' }});
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Falha ao conversar com Dify' }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ error: 'Tipo de requisição inválida' }), { status: 400 });
}
