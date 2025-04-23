"use client"

import { createContext, ReactNode, useContext, useMemo, useState } from "react"
import { CartItem } from "@/supabase/client"

type CheckoutContextType = {
    items: CartItem[]
    deliveryOption: number
    setDeliveryOption: (option: number) => void
}

const CheckoutContext = createContext<CheckoutContextType>({ items: [], deliveryOption: 0, setDeliveryOption: () => {} })

export const CheckoutProvider = ({ children, items }: { children: ReactNode, items: CartItem[] }) => {
    const [deliveryOption, update] = useState(0)

    return (
        <CheckoutContext.Provider value={{ items, deliveryOption, setDeliveryOption: (option: number) => update(option) }}>
            {children}
        </CheckoutContext.Provider>
    )
}

export const useCheckout = () => {
    const context = useContext(CheckoutContext)
    if (!context) throw new Error("useCheckout must be used within a CheckoutProvider")

    const { items, deliveryOption, setDeliveryOption } = context

    return useMemo(
        () => ({
            getItems: () => items,
            getTotal: () => items.reduce((sum, { price }) => sum + price, 0),
            getDeliveryOption: () => deliveryOption,
            setDeliveryOption
        }),
        [context]
    )
}