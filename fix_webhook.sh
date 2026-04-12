#!/bin/bash
cat << 'INNER_EOF' > src/app/api/payments/webhook/route.ts
// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Paddle, Environment, EventName } from '@paddle/paddle-node-sdk'
import { createClient } from '@supabase/supabase-js'

// Move initialization inside the POST function to avoid build-time errors when env vars are missing
export async function POST(req: NextRequest) {
  try {
    const paddle = new Paddle(process.env.PADDLE_API_KEY || 'dummy_key', {
      environment: Environment.production,
    })

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key',
    )

    const rawBody = await req.text()
    const signature = req.headers.get('paddle-signature') || ''

    // Verify webhook signature
    const event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET || 'dummy_secret',
      signature,
    )

    if (event.eventType === EventName.TransactionCompleted) {
      const transaction = event.data
      const customData = transaction.customData as {
        userId: string
        tier: string
        credits: string
      }

      if (customData?.userId && customData?.tier && customData?.credits) {
        // Update user profile with new tier and credits
        await supabaseAdmin
          .from('profiles')
          .update({
            tier: customData.tier,
            credits: parseInt(customData.credits, 10),
          })
          .eq('id', customData.userId)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 })
  }
}

// Required: disable body parsing for webhook signature verification
export const config = {
  api: { bodyParser: false }
}
INNER_EOF
