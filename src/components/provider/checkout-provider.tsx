"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { CartItem } from "@/supabase/client"
import { Tables } from "@/supabase/database"

type CheckoutContextType = {
    items: CartItem[]
    coupon?: Tables<"coupons">
    setCoupon: (coupon: Tables<"coupons">) => void
    deliveryOption?: {
        id: number
        value: number
    }
    setDeliveryOption: (option: {
        id: number
        value: number
    }) => void
}

const CheckoutContext = createContext<CheckoutContextType>({ items: [], setCoupon: () => {}, setDeliveryOption: () => {} })

export const CheckoutProvider = ({ children, items }: { children: ReactNode, items: CartItem[] }) => {
    const [deliveryOption, setDeliveryOption] = useState<{ id: number, value: number }>()
    const [coupon, setCoupon] = useState<Tables<"coupons">>()

    return (
        <CheckoutContext.Provider value={{ items, coupon, setCoupon, deliveryOption, setDeliveryOption }}>
            {children}
        </CheckoutContext.Provider>
    )
}

export const useCheckout = () => {
    const context = useContext(CheckoutContext)
    if (!context) throw new Error("useCheckout must be used within a CheckoutProvider")

    const { items, coupon, setCoupon, deliveryOption, setDeliveryOption } = context

    return useMemo(
        () => ({
            getItems: () => items,
            getTotal: () => items.reduce((sum, { price }) => sum + price, 0),
            getCoupon: () => coupon,
            setCoupon,
            getDeliveryOption: () => deliveryOption,
            setDeliveryOption
        }),
        [context]
    )
}