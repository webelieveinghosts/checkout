"use server"

import MercadoPago from "mercadopago"
import { Database } from "@/supabase/database"
import { updatePayment } from "@/supabase/admin"
import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type"

// Configurar Mercado Pago
MercadoPago.configure({
  access_token: process.env.ACCESS_TOKEN!,
})

export const createPayment = async (payment: Database["public"]["Tables"]["transactions"]["Row"], cardFormData?: ICardPaymentFormData<ICardPaymentBrickPayer>) => {
  try {
    const { name, cpf, email, phone } = payment.summary_information as any
    const fullName = name.split(" ") as string[]
    
    // ✅ Verificar se é PIX primeiro
    const isPix = payment.method === "pix"
    
    // Preparar body base
    const paymentBody: any = {
      transaction_amount: payment.total,
      description: "Pagamento WBG.",
      payer: {
        first_name: fullName[0],
        last_name: name.replace(`${fullName[0]} `, ""),
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
    
    // ✅ Se for PIX
    if (isPix ) {
      paymentBody.payment_method_id = "pix"
    } 
    // ✅ Se for cartão
    else if (cardFormData) {
      if (!cardFormData.token) throw new Error("Token do cartão não encontrado")
      if (!cardFormData.payment_method_id) throw new Error("Método de pagamento não encontrado")
      if (!cardFormData.issuer_id) throw new Error("Issuer ID não encontrado")
      
      paymentBody.payment_method_id = cardFormData.payment_method_id
      paymentBody.token = cardFormData.token
      paymentBody.issuer_id = cardFormData.issuer_id
      
      // ✅ PARCELAMENTO: Limitar a 3x
      const requestedInstallments = cardFormData.installments || 1
      paymentBody.installments = Math.min(requestedInstallments, 3)
      
      if (cardFormData.payer) {
        paymentBody.payer = { ...paymentBody.payer, ...cardFormData.payer }
      }
    } else {
      throw new Error("Dados de pagamento incompletos")
    }
    
    let result
    if (payment.payment_id) {
      result = await MercadoPago.payment.get(payment.payment_id)
    } else {
      result = await MercadoPago.payment.create(paymentBody)
      await updatePayment(payment.id, result.body.id.toString())
    }
    
    const responseBody = result.body
    
    return isPix ? {
      copyAndPaste: responseBody.point_of_interaction?.transaction_data?.qr_code,
      image: responseBody.point_of_interaction?.transaction_data?.qr_code_base64
    } : undefined
    
  } catch (error) {
    console.error("Erro ao criar pagamento:", error)
    throw error
  }
}
