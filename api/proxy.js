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

  const API_TOKEN = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJTYUxqZG04ZUdFU3Z1bFRsQWk1YkJBIiwianRpIjoiZWVjYjJlYjEtOTE2ZC00NmEwLWJhNWMtMjk3NTgzMmYxNDc2IiwiaWF0IjoxNzg0MTQxNjIxLCJleHAiOjIwOTk3NjA4MjEsInVzZXIiOiJ7XCJ0eXBlXCI6XCJhcGlcIixcImlkXCI6XCJTYUxqZG04ZUdFU3Z1bFRsQWk1YkJBXCIsXCJlbWFpbFwiOm51bGwsXCJmaXJzdE5hbWVcIjpcIkFQSSDQlNC70Y8g0JvQmiBQcm9kYW11c1wiLFwibGFzdE5hbWVcIjpudWxsLFwicGhvbmVcIjpudWxsLFwic2Nob29sSWRcIjpcInBMRnVmUEhzaGsyeXpiV0lRVGI1M3dcIixcImNvbW11bmljYXRpb25JZFwiOm51bGwsXCJjb25jdXJyZW5jeVN0YW1wXCI6bnVsbCxcInNlc3Npb25JZFwiOm51bGwsXCJjaGF0VXNlckRhdGFcIjp7XCJpZFwiOlwieEZIWHNGWjhEVXViSEM1NllkTE1kZ1wiLFwicm9sZXNcIjpbMF19fSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N5c3RlbSI6IkFkbWluIiwibmJmIjoxNzg0MTQxNjIxLCJpc3MiOiJBY2NlbCIsImF1ZCI6ImFwcC54bC5ydSJ9.gwag94evkLug9WcjpCzAfnJCmxRSddM5NDfAwlmOAyk;

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
