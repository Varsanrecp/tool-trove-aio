// supabase/functions/verify-payment/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body ?? {};

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay env not configured');
    }
    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error('Supabase service role or URL not configured for this function');
    }

    // 1) Verify signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await hmacSha256Hex(razorpayKeySecret, payload);

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch', { expected: expectedSignature, received: razorpay_signature });
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
    }

    // 2) fetch payment & ensure captured
    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    const paymentRes = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, {
      headers: { Authorization: `Basic ${authString}` }
    });

    if (!paymentRes.ok) {
      const err = await paymentRes.json().catch(() => ({}));
      console.error('Failed to fetch payment', err);
      throw new Error('Failed to fetch payment from Razorpay');
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

    // 3) fetch order to read notes (user_id/email) if you recorded them on create-order
    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`, {
      headers: { Authorization: `Basic ${authString}` }
    });

    let order: any = null;
    if (orderRes.ok) {
      order = await orderRes.json().catch(() => null);
    }

    const user_id = order?.notes?.user_id ?? body?.user_id ?? null;
    const email = order?.notes?.email ?? body?.email ?? payment?.email ?? null;
    const amount = payment.amount ?? null;
    const currency = payment.currency ?? null;

    // 4) persist subscription using service_role key
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    const start_date = new Date().toISOString();
    const end_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const displayAmount = amount ? Math.round(amount) / 100 : 0;

    const subscriptionRow: any = {
      email: email ?? null,
      plan_type: 'premium',
      status: 'active',
      amount: displayAmount ?? 0,
      currency: currency ?? 'INR',
      start_date,
      end_date,
      razorpay_order_id,
      razorpay_payment_id,
    };

    if (user_id) subscriptionRow.user_id = user_id;

    const { error: insertError } = await supabase.from('subscriptions').insert([subscriptionRow]);

    if (insertError) {
      console.error('Failed to insert subscription', insertError);
      return new Response(JSON.stringify({ error: 'Failed to persist subscription' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (err) {
    console.error('verify-payment error', err);
    return new Response(JSON.stringify({ error: err?.message ?? 'Verification failed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});
