import { createBrowserClient } from "@supabase/ssr"
import { Database } from "./database"

export const createClient = () => createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export type CartItem = {
    productId: number
    name: string
    price: number
    image: string
    size?: Database["public"]["Enums"]["size"]
    quantity: number
}

export const getCart = async (cartId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from("carts").select("*").eq("id", cartId).maybeSingle()
    const items = (data?.items ?? []) as { productId: number, quantity: number, size?: Database["public"]["Enums"]["size"] }[]

    const cart = await Promise.all(items.map(async item => {
        const { data: product } = await supabase.from("products").select("*").eq("id", item.productId).maybeSingle()
        return {
            ...item,
            name: product!.name,
            price: product!.price,
            image: product!.images[0]
        }
    }))

    return cart as CartItem[]
}