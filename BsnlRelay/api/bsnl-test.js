export default async function handler(req, res) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://bsnl.co.in/en/mobile/recharge', {
      method: 'GET',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        accept: 'text/html',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);

    res.status(200).json({
      ok: true,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      cause: err.cause?.code || err.cause?.message || null,
    });
  }
}