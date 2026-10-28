export default async function handler(req, res) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  };

  if (req.method === 'OPTIONS') {
    return res.status(204).setHeader('Access-Control-Allow-Origin', '*')
                          .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
                          .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
                          .end();
  }

  if (req.method !== 'POST') {
    return res.status(405).setHeader('Access-Control-Allow-Origin', '*').json({ error: 'Method not allowed' });
  }

  const API_TOKEN = process.env.API_TOKEN;

  // Разрешаем запускать только сценарий записи в лист ожидания
  if (!req.body || req.body.scenarioId !== 'gW58CeGS20Cx53c9XYNEnQ') {
    return res.status(403).setHeader('Access-Control-Allow-Origin', '*').json({ error: 'Forbidden' });
  }

  try {
    const response = await fetch('https://app.xl.ru/api/v1/scenario/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(req.body),
    });

    const result = await response.text();
    
    res.status(response.status)
       .setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json')
       .setHeader('Access-Control-Allow-Origin', '*')
       .send(result);
       
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).setHeader('Access-Control-Allow-Origin', '*').json({ error: 'Internal Server Error' });
  }
}
