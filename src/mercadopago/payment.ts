"use server"

import { MercadoPagoConfig, Payment } from "mercadopago"
import { Database } from "@/supabase/database"
import { updatePayment } from "@/supabase/admin"
import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type"

const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN!,
  options: { timeout: 30000 }
})

export const createPayment = async (
  payment: Database["public"]["Tables"]["transactions"]["Row"],
  cardFormData?: ICardPaymentFormData<ICardPaymentBrickPayer>
) => {
  try {
    console.log("🧾 Criando pagamento Mercado Pago:", {
      method: payment.method,
      total: payment.total,
      summary_information: payment.summary_information
    })

    const { name, cpf, email, phone } = payment.summary_information as any
    if (!name || !cpf || !email) throw new Error("Campos obrigatórios ausentes (name, cpf, email)")

    const isPix = payment.method === "pix"
    const invoice = new Payment(client)

    const paymentBody: any = {
      transaction_amount: payment.total,
      description: "Pagamento WBG.",
      payer: {
        email,
        full_name: name || "", 
        identification: { type: "CPF", number: cpf }
      },
      callback_url: `https://checkout.webelieveinghosts.com.br/${payment.id}/callback`,
      notification_url: `https://checkout.webelieveinghosts.com.br/${payment.id}/notification`,
      statement_descriptor: "WBG"
    }

    if (phone) {
      const [area, number] = phone.split(" ")
      paymentBody.payer.phone = {
        area_code: area?.replace(/\D/g, "") || "",
        number: number?.replace(/\D/g, "") || ""
      }
    }

    if (isPix) {
      paymentBody.payment_method_id = "pix"
    } else if (cardFormData) {
      const { token, payment_method_id, issuer_id, installments, payer } = cardFormData

      if (!token || !payment_method_id || !issuer_id)
        throw new Error("Campos obrigatórios do cartão ausentes")

      paymentBody.payment_method_id = payment_method_id
      paymentBody.token = token
      paymentBody.issuer_id = issuer_id
      paymentBody.installments = Math.min(installments || 1, 3)

      if (payer) {
        paymentBody.payer = {
          ...paymentBody.payer,
          ...payer,
          identification: payer.identification || paymentBody.payer.identification,
          phone: payer.phone || paymentBody.payer.phone
        }
      }
    } else {
      console.warn("⚠️ Nenhum método de pagamento definido — ignorando criação")
      return undefined
    }

    const { id, point_of_interaction } = await (
      payment.payment_id
        ? invoice.get({ id: payment.payment_id })
        : invoice.create({ body: paymentBody })
    )

    if (!payment.payment_id) await updatePayment(payment.id, id!.toString())

    return isPix
      ? {
          copyAndPaste: point_of_interaction?.transaction_data?.qr_code,
          image: point_of_interaction?.transaction_data?.qr_code_base64
        }
      : undefined

  } catch (error) {
    console.error("❌ Erro ao criar pagamento:", error)
    throw error
  }
}

// ✅ Buscar pagamento por ID
export const getPaymentById = async (paymentId: string) => {
  try {
    const invoice = new Payment(client)
    const result = await invoice.get({ id: paymentId })
    return result
  } catch (error) {
    console.error("❌ Erro ao buscar pagamento:", error)
    throw error
  }
}
