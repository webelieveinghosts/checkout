import { successPayment } from "@/supabase/admin"
import { getPaymentById } from "@/mercadopago/payment"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: { transactionId: string } }) {
    try {
        const transactionId = params.transactionId // id da SUPABASE
        const searchParams = req.nextUrl.searchParams
        const topic = searchParams.get("topic")
        const paymentId = searchParams.get("id") // id do MERCADO PAGO

        console.log("🔔 Webhook recebido", { transactionId, topic, paymentId })

        if (topic !== "payment") return NextResponse.json({ message: "Invalid topic" }, { status: 400 })

        const info = await getPaymentById(paymentId!)
        if (!info || info.status !== "approved") return NextResponse.json({ message: "Not approved" }, { status: 200 })

        // atualiza o status no Supabase com base no ID interno
        await successPayment(paymentId!)

        console.log(`✅ Transação ${transactionId} marcada como "paid"`)
        return NextResponse.json({ message: "approved" }, { status: 200 })
    } catch (err) {
        console.error("💥 Erro no webhook:", err)
        return NextResponse.json({ message: "Internal error" }, { status: 500 })
    }
}
