"use client"

import { createClient } from "@/supabase/client"
import { redirect } from "next/navigation"
import { useEffect } from "react"

export const Notify = ({ id }: { id: string }) => {
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase.channel("payment_update").on("postgres_changes", {
            event: "UPDATE",
            schema: "public",
            table: "transactions",
            filter: `id=eq.${id}`
        }, event => event.new.status === "paid" && redirect(`/${id}/success`))
        channel.subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [])

    return <></>
}