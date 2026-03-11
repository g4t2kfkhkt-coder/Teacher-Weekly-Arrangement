import { kv } from '@vercel/kv';

export const config = {
  runtime: 'edge',
};

// ⚠️ 修改这里的密码，防止别人篡改你的课表
const API_TOKEN = "zby20010117";

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
    // 读取数据
    if (req.method === 'GET') {
      const week = req.nextUrl.searchParams.get('week') || '0';
      const key = `timetable_week_${week}`;
      const data = await kv.get(key);
      
      return new Response(JSON.stringify(data || null), {
        status: 200,
        headers,
      });
    }

    // 保存数据
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
      
      if (!week || !data) {
        return new Response(JSON.stringify({ error: 'Missing data' }), {
          status: 400,
          headers,
        });
      }

      const key = `timetable_week_${week}`;
      await kv.set(key, data);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    }

    return new Response('Method Not Allowed', { status: 405, headers });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers,
    });
  }
}
