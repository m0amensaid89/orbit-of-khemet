#!/bin/bash
cat << 'INNER_EOF' > src/app/api/payments/subscribe/route.ts
// src/app/api/payments/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Paddle, Environment } from '@paddle/paddle-node-sdk'
import { createClient } from '@/lib/supabase/server'

const paddle = new Paddle(process.env.PADDLE_API_KEY!, {
  environment: Environment.production,
})

// Map tier names to Paddle Price IDs
const PRICE_MAP: Record<string, string> = {
  personal_basic:       process.env.PADDLE_PRICE_ID_PERSONAL_BASIC!,
  personal_explorer:    process.env.PADDLE_PRICE_ID_PERSONAL_EXPLORER!,
  personal_starter:     process.env.PADDLE_PRICE_ID_PERSONAL_STARTER!,
  business_pro:         process.env.PADDLE_PRICE_ID_BUSINESS_PRO!,
  business_standard:    process.env.PADDLE_PRICE_ID_BUSINESS_STANDARD!,
  business_enterprise:  process.env.PADDLE_PRICE_ID_BUSINESS_ENTERPRISE!,
}

// Tier credits map
const TIER_CREDITS: Record<string, number> = {
  personal_basic:       7000,
  personal_explorer:    11200,
  personal_starter:     22400,
  business_pro:         38500,
  business_standard:    420000,
  business_enterprise:  840000,
}

export async function POST(req: NextRequest) {
  try {
    const { tier } = await req.json()

    if (!PRICE_MAP[tier]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Paddle checkout session
    const transaction = await paddle.transactions.create({
      items: [{
        priceId: PRICE_MAP[tier],
        quantity: 1,
      }],
      customData: {
        userId: user.id,
        tier,
        credits: TIER_CREDITS[tier].toString(),
      },
    })

    return NextResponse.json({
      checkoutUrl: `https://checkout.paddle.com/checkout/custom/${transaction.id}`,
      transactionId: transaction.id,
    })

  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
INNER_EOF
