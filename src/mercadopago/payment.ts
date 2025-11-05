"use server"

import { MercadoPagoConfig, Payment } from "mercadopago"
import { Database } from "@/supabase/database"
import { updatePayment } from "@/supabase/admin"
import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type"

// Timeout aumentado para 30s
const client = new MercadoPagoConfig({
  accessToken: process.env.ACCESS_TOKEN!,
  options: { timeout: 30000 }
})

export const createPayment = async (
  payment: Database["public"]["Tables"]["transactions"]["Row"],
  cardFormData?: ICardPaymentFormData<ICardPaymentBrickPayer>
) => {
  try {
    const { name, cpf, email, phone } = payment.summary_information as any

    if (!name || !cpf || !email)
      throw new Error("Campos obrigatórios ausentes (name, cpf, email)")



    // separar first_name e last_name
    const fullName = name.split(" ")
    const first_name = fullName[0]
    const last_name = fullName.slice(1).join(" ") || "-"

    const isPix = payment.method === "pix"
    const invoice = new Payment(client)

    const paymentBody: any = {
      transaction_amount: payment.total,
      description: "Pagamento WBG.",
      payer: {
        first_name,
        last_name,
        identification: { type: "CPF", number: cpf },
        email
      },
      callback_url: `https://checkout.wbg.wtf/${payment.id}/callback`,
      notification_url: "https://checkout.wbg.wtf/notification",
      statement_descriptor: "WBG"
    }


    if (phone) {
      const [area, number] = phone.replace(/\(|\)/g, "").split(" ")
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
          identification: payer.identification || paymentBody.payer.identification
        }
      }
    } else {
      throw new Error("Dados de pagamento incompletos")
    }

    const { id, point_of_interaction } = await (
      payment.payment_id
        ? invoice.get({ id: payment.payment_id })
        : invoice.create({ body: paymentBody })
    )

    // ✅ Log do pagamento criado/recuperado
    console.log("✅ Payment created/retrieved:", {
      payment_id: id,
      method: payment.method,
      total: payment.total,
      payer: paymentBody.payer,
      point_of_interaction
    })

    if (!payment.payment_id) await updatePayment(payment.id, id!.toString())

    return isPix
      ? {
        copyAndPaste: point_of_interaction?.transaction_data?.qr_code,
        image: point_of_interaction?.transaction_data?.qr_code_base64
      }
      : undefined

  } catch (error) {
    console.error("Erro ao criar pagamento:", error)
    throw error
  }
}

export const getPaymentById = async (paymentId: string) => {
  try {
    const invoice = new Payment(client)
    const result = await invoice.get({ id: paymentId })

    // ✅ Log do pagamento buscado
    console.log("✅ Payment retrieved by ID:", result)

    return result
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error)
    throw error
  }
}
