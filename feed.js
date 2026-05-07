// netlify/functions/feed.js
// CommonJS syntax — works on ALL Netlify Node versions

const https = require('https');

const CHANNEL_ID = 'UCML5eZHbzv6pZ-iwKVZW6Ow';

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/xml, application/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function clean(str) {
  return (str || '')
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function parseXML(xml) {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi) || [];
  return entries.map(e => {
    const tag = (name) => {
      const m = e.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)<\\/' + name + '>', 'i'));
      return m ? clean(m[1]) : '';
    };
    const attr = (name, a) => {
      const m = e.match(new RegExp('<' + name + '[^>]+' + a + '="([^"]*)"', 'i'));
      return m ? m[1] : '';
    };
    return {
      videoId:   tag('yt:videoId'),
      title:     tag('title'),
      published: tag('published'),
      views:     attr('media:statistics', 'views') || '0',
    };
  }).filter(v => v.videoId && v.title);
}

exports.handler = async function(event, context) {
  const CORS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  const RSS = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + CHANNEL_ID;

  try {
    const { status, body } = await get(RSS);

    if (status !== 200) {
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ error: 'YouTube HTTP ' + status, videos: [] }),
      };
    }

    const videos = parseXML(body);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ videos, count: videos.length, fetchedAt: new Date().toISOString() }),
    };

  } catch (err) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ error: err.message, videos: [] }),
    };
  }
};
