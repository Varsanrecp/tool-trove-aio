import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// We will use a standard fetch call instead of the Razorpay library to avoid import issues
Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount = 10, currency = 'INR' } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount specified');
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials');
      throw new Error('Payment configuration error');
    }
    
    // Construct the basic auth string
    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    console.log('Creating order with amount:', amount, 'currency:', currency);

    // Make a direct fetch call to the Razorpay API
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to smallest currency unit (paise)
        currency,
        receipt: `order_${Date.now()}`,
        payment_capture: 1,
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('Razorpay API error:', errorData);
      throw new Error(errorData.error.description || 'Failed to create payment order');
    }

    const order = await orderResponse.json();
    console.log('Order created successfully:', order);

    return new Response(
      JSON.stringify(order),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-order function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});