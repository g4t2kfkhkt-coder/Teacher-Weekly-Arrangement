import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

const API_TOKEN = "zby20010117"; // 记得改成和你的 index.html 一致的密码

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response('OK', { headers });
  }

  try {
    // GET - 读取数据
    if (req.method === 'GET') {
      // 修复：使用 req.url 而不是 req.nextUrl
      const url = new URL(req.url);
      const week = url.searchParams.get('week') || '0';
      const key = `timetable_week_${week}`;
      
      console.log('读取数据，key:', key);
      
      const data = await kv.get(key);
      
      console.log('读取结果:', data);
      
      return new Response(JSON.stringify(data || null), {
        status: 200,
        headers,
      });
    }

    // POST - 保存数据
    if (req.method === 'POST') {
      const authHeader = req.headers.get('Authorization');
      if (authHeader !== `Bearer ${API_TOKEN}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers,
        });
      }

      const body = await req.json();
      const { week, data } = body;
      
      console.log('保存数据，week:', week, 'hasData:', !!data);
      
      if (week === undefined || week === null) {
        return new Response(JSON.stringify({ error: 'Missing week' }), {
          status: 400,
          headers,
        });
      }

      const key = `timetable_week_${week}`;
      const dataToSave = data || {};
      
      await kv.set(key, dataToSave);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    }

    return new Response('Method Not Allowed', { status: 405, headers });
  } catch (error) {
    console.error('API 错误:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
}
