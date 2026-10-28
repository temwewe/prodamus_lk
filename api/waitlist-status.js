// Отвечает кабинету, на какие курсы ученик уже в листе ожидания.
// Какие теги проверять, берём прямо из сценария «Добавление тега при клике в ЛК»:
// условие «target_tag содержит "Предзапись ЛАП"» → блок «Добавить теги» после него.
// Поэтому при смене тега в сценарии кнопка в кабинете подстраивается сама.

const API = 'https://app.xl.ru/api/v1';
const SCENARIO_ID = 'gW58CeGS20Cx53c9XYNEnQ';
const CACHE_MS = 5 * 60 * 1000;

let cache = { at: 0, rules: null };

async function api(path, token) {
  const r = await fetch(API + path, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`XL API ${r.status}`);
  const json = await r.json();
  if (!json.success) throw new Error('XL API error');
  return json.body;
}

// [{ phrase: 'Предзапись ЛАП', tagIds: ['...'] }, ...]
async function loadRules(token) {
  if (cache.rules && Date.now() - cache.at < CACHE_MS) return cache.rules;

  const fields = encodeURIComponent('{id, actionType, payload}');
  const body = await api(`/scenario-node?scenarioId=${SCENARIO_ID}&take=100&fields=${fields}`, token);
  const nodes = Object.fromEntries(body.items.map((n) => [n.id, n]));
  const rules = [];

  for (const link of body.links || []) {
    if (link.type !== 'success') continue;
    const cond = nodes[link.parentNodeId];
    const action = nodes[link.childNodeId];
    if (!cond || !action || cond.actionType !== 'ConditionScenarioAction' || action.actionType !== 'AddLeadTagsScenarioAction') continue;

    try {
      const field = JSON.parse(cond.payload).groups[0].fields[0];
      const phrase = JSON.parse(field.value).value;
      const tagIds = JSON.parse(action.payload).tags.map((t) => t.id);
      if (phrase && tagIds.length) rules.push({ phrase, tagIds });
    } catch (e) {
      // узел другого вида, пропускаем
    }
  }

  cache = { at: Date.now(), rules };
  return rules;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const contactId = String(req.query.contactId || '');
  if (!/^[A-Za-z0-9_-]{10,40}$/.test(contactId)) return res.status(400).json({ error: 'Bad contactId' });

  try {
    const token = process.env.API_TOKEN;
    const rules = await loadRules(token);
    const fields = encodeURIComponent('{id, studentTagLinks{tagId}}');
    const student = await api(`/student/${contactId}?fields=${fields}`, token);
    const has = new Set((student.studentTagLinks || []).map((l) => l.tagId));

    const enrolled = rules.filter((r) => r.tagIds.some((id) => has.has(id))).map((r) => r.phrase);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: true, enrolled });
  } catch (error) {
    console.error('waitlist-status error:', error);
    return res.status(502).json({ success: false });
  }
}
