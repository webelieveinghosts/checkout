import { getPaymentById } from "@/mercadopago/payment"
import { successPayment } from "@/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    if (searchParams.get("topic") !== "payment") return NextResponse.json({ message: "No valid topic." }, { status: 500 })

    const info = await getPaymentById(searchParams.get("id")!)
    if (!info || info.status != "approved") return NextResponse.json({ message: "No valid payment id." }, { status: 201 })

    await successPayment(searchParams.get("id")!)
    return Response.json({ message: "approved" }, { status: 200 })
}