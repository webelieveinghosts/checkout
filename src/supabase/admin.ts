"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database"
import { CartItem } from "./client"

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

export const getPaymentById = async (id: string) => {
    const { data } = await supabase.from("transactions").select("*").eq("id", id).maybeSingle()
    return data
}

export const getCoupon = async (name: string) => {
    const { data } = await supabase.from("coupons").select("*").eq("name", name).maybeSingle()
    return data
}

export const createPaymentCart = async (cart: CartItem[], delivery: any, summary: any, total: number, method: "pix" | "creditcard") => {
    const { data } = await supabase.from("transactions").insert({
        cart,
        delivery_information: delivery,
        summary_information: summary,
        status: "pending",
        total,
        method
    }).select().maybeSingle()

    return data!.id
}

export const updatePayment = async (id: string, payment_id: string) => {
    const { error } = await supabase.from("transactions").update({ payment_id }).eq("id", id)
    return error ? false : true
}

export const successPayment = async (payment_id: string) => {
    const { error } = await supabase.from("transactions").update({ status: "paid" }).eq("payment_id", payment_id)
    return error ? false : true
}