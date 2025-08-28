// supabase/functions/verify-payment/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

function bufToHex(buffer: ArrayBuffer) {
  const arr = Array.from(new Uint8Array(buffer));
  return arr.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256Hex(secret: string, payload: string) {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(payload));
  return bufToHex(sig);
}

Deno.serve(async (req) => {
  // echo origin so we don't use '*' (keeps credentials safe)
  const origin = (req.headers.get('origin') || '*');

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({ error: 'Razorpay environment variables not configured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }
    if (!supabaseUrl || !supabaseServiceRole) {
      return new Response(JSON.stringify({ error: 'Supabase service role / URL not configured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    // Verify signature (order|payment)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await hmacSha256Hex(razorpayKeySecret, payload);

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch', { expected: expectedSignature, received: razorpay_signature });
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // Fetch payment to ensure it's captured
    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
      headers: { Authorization: `Basic ${authString}` }
    });

    if (!paymentRes.ok) {
      const err = await paymentRes.json().catch(() => ({}));
      console.error('Failed to fetch payment', err);
      return new Response(JSON.stringify({ error: 'Failed to fetch payment from Razorpay' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    const payment = await paymentRes.json();
    if (String(payment.order_id) !== String(razorpay_order_id)) {
      console.error('Payment order mismatch', { paymentOrder: payment.order_id, expectedOrder: razorpay_order_id });
      return new Response(JSON.stringify({ error: 'Payment does not match order' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    if (payment.status !== 'captured') {
      console.error('Payment not captured', payment.status);
      return new Response(JSON.stringify({ error: 'Payment not captured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // Persist subscription server-side (service role)
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const start_date = new Date().toISOString();
    const end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const displayAmount = payment.amount ? Math.round(payment.amount) / 100 : 0;

    const subscriptionRow: any = {
      email: payment.email ?? null,
      plan_type: 'premium',
      status: 'active',
      amount: displayAmount ?? 0,
      currency: payment.currency ?? 'INR',
      start_date,
      end_date,
      razorpay_order_id,
      razorpay_payment_id,
    };

    // if you have user_id in payment notes or request, add it
    if (body.user_id) subscriptionRow.user_id = body.user_id;

    const { error: insertError } = await supabase.from('subscriptions').insert([subscriptionRow]);

    if (insertError) {
      console.error('Failed to insert subscription', insertError);
      return new Response(JSON.stringify({ error: 'Failed to persist subscription' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err) {
    console.error('verify-payment error', err);
    return new Response(JSON.stringify({ error: err?.message ?? 'Verification failed' }), { headers: { 'Content-Type': 'application/json', ...(req.headers.get('origin') ? { 'Access-Control-Allow-Origin': req.headers.get('origin'), 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Credentials': 'true' } : {}) }, status: 400 });
  }
});
