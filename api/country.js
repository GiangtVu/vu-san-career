// Vercel function: the visitor's country (ISO code, e.g. "VN") from Vercel's IP geolocation,
// which the app uses to pick its language on a first visit (src/lib/lang.jsx).
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country: req.headers['x-vercel-ip-country'] || null });
}
