import { getPaymentById } from "@/mercadopago/payment"
import { successPayment } from "@/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        console.log("📩 [Webhook] Nova requisição recebida:", req.nextUrl.toString())

        const searchParams = req.nextUrl.searchParams
        const topic = searchParams.get("topic")
        const paymentId = searchParams.get("id")

        console.log("🔍 [Webhook] Parâmetros recebidos:", {
            topic,
            paymentId
        })

        if (topic !== "payment") {
            console.warn("⚠️ [Webhook] Tópico inválido:", topic)
            return NextResponse.json({ message: "No valid topic." }, { status: 400 })
        }

        if (!paymentId) {
            console.warn("⚠️ [Webhook] Nenhum payment_id informado.")
            return NextResponse.json({ message: "Missing payment ID." }, { status: 400 })
        }

        console.log("💳 [Webhook] Buscando informações do pagamento:", paymentId)
        const info = await getPaymentById(paymentId)

        console.log("📦 [Webhook] Retorno do getPaymentById:", {
            id: info?.id,
            status: info?.status,
            status_detail: info?.status_detail,
            transaction_amount: info?.transaction_amount,
        })

        if (!info || info.status !== "approved") {
            console.log("❌ [Webhook] Pagamento não aprovado ou inválido:", info?.status)
            return NextResponse.json({ message: "No valid payment id." }, { status: 201 })
        }

        console.log("✅ [Webhook] Pagamento aprovado! Atualizando Supabase…")
        const success = await successPayment(paymentId)
        console.log("💾 [Webhook] Resultado da atualização:", success ? "OK ✅" : "Erro ❌")

        return NextResponse.json({ message: "approved" }, { status: 200 })

    } catch (err) {
        console.error("🔥 [Webhook] Erro ao processar notificação:", err)
        return NextResponse.json({ message: "Internal server error." }, { status: 500 })
    }
}
