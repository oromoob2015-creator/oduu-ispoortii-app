// netlify/functions/feed.js
// Uses native fetch (Node 18+) — no require() needed

const CHANNEL_ID = 'UCML5eZHbzv6pZ-iwKVZW6Ow';

export default async (req, context) => {
  const RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300',
  };

  try {
    const res = await fetch(RSS, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/xml, text/xml, */*',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `YouTube HTTP ${res.status}`, videos: [] }), { status: 200, headers });
    }

    const xml = await res.text();

    // Parse entries
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];
    const videos = entries.map(m => {
      const e = m[1];
      const get = tag => {
        const r = e.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return r ? r[1].trim().replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'") : '';
      };
      const attr = (tag, a) => {
        const r = e.match(new RegExp(`<${tag}[^>]+${a}="([^"]*)"`, 'i'));
        return r ? r[1] : '';
      };
      return {
        videoId:   get('yt:videoId'),
        title:     get('title'),
        published: get('published'),
        views:     attr('media:statistics', 'views') || '0',
      };
    }).filter(v => v.videoId && v.title);

    return new Response(JSON.stringify({ videos, fetchedAt: new Date().toISOString() }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, videos: [] }), { status: 200, headers });
  }
};

export const config = { path: '/api/feed' };
