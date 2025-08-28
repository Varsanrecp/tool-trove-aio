// supabase/functions/create-order/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const amount = Number(body?.amount ?? 10);
    const currency = body?.currency ?? 'INR';
    const user_id = body?.user_id ?? null;
    const email = body?.email ?? null;

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount specified');
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      throw new Error('Payment configuration error');
    }

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    // Build notes object (only include if present)
    const notes: Record<string, string> = {};
    if (user_id) notes.user_id = String(user_id);
    if (email) notes.email = String(email);

    console.log('Creating order', { amount, currency, notes });

    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: `order_${Date.now()}`,
        payment_capture: 1,
        notes,
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({}));
      console.error('Razorpay API error:', errorData);
      throw new Error((errorData?.error?.description) || 'Failed to create payment order');
    }

    const order = await orderResponse.json();
    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Error in create-order function:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
