import MidtransClient from 'midtrans-client'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const auth = request.headers.get('authorization') || ''
    const token = auth.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const userId = payload.id
    const userEmail = payload.email || `user${userId}@nusaflix.com`
    const userName = payload.name || 'User Nusaflix'

    const { plan, amount } = await request.json()

    // Create Snap instance
    let snap = new MidtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY
    })

    const orderId = `NUSA-${userId}-${Date.now()}`

    let parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount
      },
      customer_details: {
        first_name: userName,
        email: userEmail
      },
      item_details: [
        {
          id: plan,
          price: amount,
          quantity: 1,
          name: `Nusaflix Premium - ${plan}`
        }
      ],
      // Callback URL optional, Snap Handle internally
    }

    const transaction = await snap.createTransaction(parameter)
    const snapToken = transaction.token

    return NextResponse.json({ token: snapToken, orderId })

  } catch (error) {
    console.error('MIDTRANS ERROR:', error)
    return NextResponse.json({ error: 'Gagal membuat transaksi pembayaran' }, { status: 500 })
  }
}
