"use client"

import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type"
import { Database } from "@/supabase/database"
import { CardPayment } from "@mercadopago/sdk-react"

import { initMercadoPago } from "@mercadopago/sdk-react"
import { createPayment } from "@/mercadopago/payment"
initMercadoPago("APP_USR-363935cd-0e0c-4b75-a0c9-a5cc6a9d2646", {
    locale: "pt-BR"
})

export const Payment = ({ payment }: { payment: Database["public"]["Tables"]["transactions"]["Row"] }) => {
    const handleCardSubmit = async (cardFormData: ICardPaymentFormData<ICardPaymentBrickPayer>) => {
        const paymentData = await createPayment(payment, cardFormData)
    }

    const { email, cpf } = payment.summary_information as any
    return (<CardPayment initialization={{ amount: payment.total, payer: { email, identification: {
        type: "CPF",
        number: cpf
    } } }} customization={{
        paymentMethods: {
            maxInstallments: 3
        }
    }} onSubmit={handleCardSubmit} onError={(error) => console.error("Error: rendering CardPayment:", error)} />)
}
