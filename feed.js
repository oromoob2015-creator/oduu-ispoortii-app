// Netlify Function: /netlify/functions/feed
// Fetches YouTube RSS on the server — no CORS issues

const https = require('https');

const CHANNEL_ID = 'UCML5eZHbzv6pZ-iwKVZW6Ow';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OduuIspoortii/1.0)',
        'Accept': 'application/xml, text/xml, */*',
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function parseEntry(entry) {
  const get = tag => {
    const m = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, 'i'));
    return m ? m[1].trim() : '';
  };
  const attr = (tag, a) => {
    const m = entry.match(new RegExp(`<${tag}[^>]+${a}="([^"]*)"`, 'i'));
    return m ? m[1] : '';
  };

  const videoId = get('yt:videoId') || attr('link', 'href').match(/v=([^&]+)/)?.[1] || '';
  const title   = get('title').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  const published = get('published');
  const views   = attr('media:statistics', 'views') || '0';
  const description = get('media:description').replace(/<!\[CDATA\[|\]\]>/g, '').slice(0, 200);

  return { videoId, title, published, views, description };
}

exports.handler = async () => {
  try {
    const { status, body } = await httpsGet(RSS_URL);

    if (status !== 200) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `YouTube returned ${status}` }),
      };
    }

    // Extract all <entry> blocks
    const entryMatches = body.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
    const videos = entryMatches.map(parseEntry).filter(v => v.videoId && v.title);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // cache 5 minutes
      },
      body: JSON.stringify({ videos, fetchedAt: new Date().toISOString() }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
