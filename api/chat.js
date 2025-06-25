// Arquivo: api/chat.js
export const config = {
  runtime: 'edge', // Usa uma infraestrutura rápida e moderna
};

export default async function handler(request) {
  // Pega os dados enviados pelo seu formulário do WordPress
  const { inputs, query, conversation_id } = await request.json();

  // Pega sua chave secreta do Dify das variáveis de ambiente da Vercel (seguro!)
  const DIFY_API_KEY = process.env.DIFY_API_KEY;

  try {
    // Faz a chamada para a API do Dify, exatamente como na documentação
    const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputs || {},
        query: query,
        user: 'wordpress-user', // Pode customizar se quiser
        response_mode: 'streaming',
        conversation_id: conversation_id || '',
      }),
    });

    // Retorna a resposta em streaming do Dify diretamente para o seu site
    return new Response(difyResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to connect to Dify API' }), { status: 500 });
  }
}
