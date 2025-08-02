import { set } from '@netlify/blobs';

export default async (req, context) => {
  const body = await req.json();
  const confession = body.confession;
  const timestamp = Date.now();

  // Store it with a timestamp-based key
  await set('confessions', `${timestamp}.json`, JSON.stringify(confession), {
    access: 'public', // or 'private' if you don't want it exposed
  });

  return new Response(JSON.stringify({ status: 'saved' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
