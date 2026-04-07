import MidtransClient from 'midtrans-client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()

    // Order ID format: NUSA-{userId}-{timestamp}
    const orderIdParts = body.order_id.split('-')
    const userId = parseInt(orderIdParts[1])

    if (!userId) {
      return NextResponse.json({ error: 'Order ID tidak valid' }, { status: 400 })
    }

    // Verify transaction with Midtrans
    let snap = new MidtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    })

    const statusResponse = await snap.transaction.notification(body)
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status

    console.log(`Transaction ID: ${statusResponse.transaction_id}, Order ID: ${statusResponse.order_id}, Status: ${transactionStatus}`)

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'challenge') {
        // Handle fraud challenge (optional)
      } else {
        // Upgrade User to Premium
        await prisma.user.update({
          where: { id: userId },
          data: { isPremium: true }
        })
        console.log(`User ${userId} berhasil di-upgrade ke PREMIUM via Midtrans`)
      }
    } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
      // Handle failed payment (optional, user stays free)
    } else if (transactionStatus === 'pending') {
      // User is paying, nothing to do
    }

    return NextResponse.json({ message: 'Notification received and processed' })

  } catch (error) {
    console.error('MIDTRANS NOTIFICATION ERROR:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
