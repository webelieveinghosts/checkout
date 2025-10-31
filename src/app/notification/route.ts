import { getPaymentById } from "@/mercadopago/payment"
import { successPayment } from "@/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        console.log("🔔 [Webhook recebido] URL:", req.nextUrl.toString())

        const searchParams = req.nextUrl.searchParams
        const topic = searchParams.get("topic")
        const paymentId = searchParams.get("id")

        console.log("📦 [Parâmetros recebidos]:", { topic, paymentId })

        if (topic !== "payment") {
            console.warn("⚠️ Tópico inválido:", topic)
            return NextResponse.json({ message: "No valid topic." }, { status: 500 })
        }

        console.log("🔍 Buscando informações do pagamento no Mercado Pago...")
        const info = await getPaymentById(paymentId!)

        console.log("💳 [Dados do pagamento obtidos]:", info)
        if (!info || info.status !== "approved") {
            console.warn("🚫 Pagamento inválido ou ainda não aprovado:", info?.status)
            return NextResponse.json({ message: "No valid payment id." }, { status: 201 })
        }

        console.log("✅ Pagamento aprovado! Atualizando status no Supabase...")

        await successPayment(paymentId!)

        console.log("📊 Status atualizado com sucesso no Supabase para ID:", paymentId)

        return Response.json({ message: "approved" }, { status: 200 })
    } catch (err) {
        console.error("💥 Erro ao processar webhook:", err)
        return NextResponse.json({ message: "Internal error." }, { status: 500 })
    }
}
