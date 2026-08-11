export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'Unknown IP';
  const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || 'Unknown Country';
  const city = req.headers['x-vercel-ip-city'] || 'Unknown City';
  const userAgent = req.headers['user-agent'] || 'Unknown User-Agent';
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC';

  let totalViews = '—';

  try {
    const countRes = await fetch('https://komarev.com/ghpvc/?username=yvesseraphin&color=0079ff');
    if (countRes.ok) {
      const svgText = await countRes.text();
      const match = svgText.match(/<text[^>]*>(\d+)<\/text>/g);
      if (match && match.length > 0) {
        const lastNum = match[match.length - 1].replace(/<[^>]+>/g, '');
        if (!isNaN(parseInt(lastNum, 10))) {
          totalViews = parseInt(lastNum, 10);
        }
      }
    }
  } catch (e) {
    console.warn('Failed to fetch profile counter:', e.message);
  }

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (slackWebhookUrl) {
    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *New GitHub Profile Visit!*`,
          blocks: [
            {
              type: 'header',
              text: { type: 'plain_text', text: '👤 GitHub Profile Visitor Alert', emoji: true }
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Total Profile Views:* ${totalViews}` },
                { type: 'mrkdwn', text: `*Location:* ${city}, ${country}` },
                { type: 'mrkdwn', text: `*Timestamp:* ${timestamp}` },
                { type: 'mrkdwn', text: `*IP Address:* ${ip}` }
              ]
            },
            {
              type: 'context',
              elements: [
                { type: 'mrkdwn', text: `*User-Agent:* \`${userAgent.slice(0, 150)}\`` }
              ]
            }
          ]
        })
      });
    } catch (err) {
      console.error('Failed to post to Slack:', err.message);
    }
  }

  const transparentGif = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.status(200).send(transparentGif);
}
