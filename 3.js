export default async function handler(req, res) {
  // 1. Настраиваем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  // 2. Обрабатываем preflight-запрос
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // 3. Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 4. Берем токен из переменных окружения (БЕЗОПАСНОСТЬ!)
  const API_TOKEN = process.env.API_TOKEN; 

  try {
    // 5. Делаем запрос к целевому API
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
    
    // 6. Возвращаем ответ клиенту
    res.status(response.status).setHeader('Content-Type', response.headers.get('Content-Type') || 'application/json').send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
