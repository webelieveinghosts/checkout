"use server"

import { MercadoPagoConfig, Payment } from "mercadopago"
import { Database } from "@/supabase/database"
import { updatePayment } from "@/supabase/admin"
import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type"

// Aumentar timeout de 5000ms para 30000ms (30 segundos)
const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN!, options: { timeout: 30000 } })

export const createPayment = async (payment: Database["public"]["Tables"]["transactions"]["Row"], cardFormData?: ICardPaymentFormData<ICardPaymentBrickPayer>) => {
    try {
        const { name, cpf, email, phone } = payment.summary_information as any
        const fullName = name.split(" ") as string[]
        
        const invoice = new Payment(client)
        
        // Preparar body base
        const paymentBody: any = {
            transaction_amount: payment.total,
            description: "Pagamento WBG.",
            payment_method_id: payment.method === "pix" ? "pix" : cardFormData?.payment_method_id,
            payer: {
                first_name: fullName[0],
                last_name: name.replace(`${fullName[0]}`, ""),
                identification: {
                    type: "CPF",
                    number: cpf
                },
                phone: {
                    area_code: phone.split(" ")[0].replaceAll(/\D/g, ""),
                    number: phone.split(" ")[1]
                },
                email,
            },
            callback_url: `https://checkout.webelieveinghosts.com.br/${payment.id}/success`,
            notification_url: "https://checkout.webelieveinghosts.com.br/notification",
            statement_descriptor: "WBG",
        }

        // Se for pagamento com cartão, adicionar informações adicionais
        if (payment.method !== "pix" && cardFormData) {
            paymentBody.token = cardFormData.token
            paymentBody.issuer_id = cardFormData.issuer_id
            
            // PARCELAMENTO: Limitar a no máximo 3 parcelas
            const requestedInstallments = cardFormData.installments || 1
            paymentBody.installments = Math.min(requestedInstallments, 3)
            
            // Adicionar informações do pagador se disponível
            if (cardFormData.payer) {
                paymentBody.payer = {
                    ...paymentBody.payer,
                    ...cardFormData.payer
                }
            }
        }

        const { id, point_of_interaction } = await (payment.payment_id ? 
            invoice.get({ id: payment.payment_id }) : 
            invoice.create({ body: paymentBody })
        )

        if (!payment.payment_id) await updatePayment(payment.id, id!.toString())
        
        return payment.method === "pix" ? { 
            copyAndPaste: point_of_interaction!.transaction_data!.qr_code, 
            image: point_of_interaction!.transaction_data!.qr_code_base64 
        } : undefined
        
    } catch (error) {
        console.error("Erro ao criar pagamento:", error)
        throw error
    }
}

export const getPaymentById = async (id: string) => {
    try {
        return new Payment(client).get({ id })
    } catch (ignored) {
        return undefined
    }
}
