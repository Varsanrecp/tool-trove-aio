
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import Razorpay from 'npm:razorpay@2.9.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount = 10, currency = 'INR' } = await req.json()
    
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount specified')
    }

    // Initialize Razorpay with better error handling
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Missing Razorpay credentials')
      throw new Error('Payment configuration error')
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    console.log('Creating order with amount:', amount, 'currency:', currency)

    // Create order with better error handling
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to smallest currency unit (paise)
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    }).catch(error => {
      console.error('Razorpay order creation error:', error)
      throw new Error('Failed to create payment order')
    })

    console.log('Order created successfully:', order)

    return new Response(
      JSON.stringify(order),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in create-order function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
