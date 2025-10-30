"use server"

// import { MercadoPagoConfig, Payment } from "mercadopago"
// import { Database } from "@/supabase/database"
// import { updatePayment } from "@/supabase/admin"
// import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type"

// Aumentar timeout de 5000ms para 30000ms (30 segundos)
const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN!, options: { timeout: 30000 } })

export const createPayment = async (payment: Database["public"]["Tables"]["transactions"]["Row"], cardFormData?: ICardPaymentFormData<ICardPaymentBrickPayer>) => {
    try {
        const { name, cpf, email, phone } = payment.summary_information as any
        const fullName = name.split(" ") as string[]

        const invoice = new Payment(client)

        // ✅ Verificar se é PIX p"use server"

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
    const fullName = name?.split(" ") ?? []

    const invoice = new Payment(client)
    const isPix = payment.method === "pix"

    const paymentBody: any = {
      transaction_amount: payment.total,
      description: "Pagamento WBG.",
      payer: {
        first_name: fullName[0] || "",
        last_name: fullName.slice(1).join(" ") || "",
        identification: {
          type: "CPF",
          number: cpf
        },
        email
      },
      callback_url: `https://checkout.webelieveinghosts.com.br/${payment.id}/callback`,
      notification_url: `https://checkout.webelieveinghosts.com.br/${payment.id}/notification`,
      statement_descriptor: "WBG"
    }

    // ✅ Telefone (se existir)
    if (phone) {
      const [area, number] = phone.split(" ")
      paymentBody.payer.phone = {
        area_code: area?.replace(/\D/g, "") || "",
        number: number?.replace(/\D/g, "") || ""
      }
    }

    // ✅ PIX
    if (isPix) {
      paymentBody.payment_method_id = "pix"
    }

    // ✅ Cartão de crédito
    else if (cardFormData) {
      const { token, payment_method_id, issuer_id, installments, payer } = cardFormData

      if (!token) throw new Error("Token do cartão não encontrado")
      if (!payment_method_id) throw new Error("Método de pagamento não encontrado")
      if (!issuer_id) throw new Error("Issuer ID não encontrado")

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
      throw new Error("Dados de pagamento incompletos")
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
    console.error("Erro ao criar pagamento:", error)
    throw error
  }
}

// ✅ Buscar pagamento por ID (usado em notification/route.ts)
export const getPaymentById = async (paymentId: string) => {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.ACCESS_TOKEN!,
      options: { timeout: 30000 }
    })
    const invoice = new Payment(client)
    const result = await invoice.get({ id: paymentId })
    return result
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error)
    throw error
  }
}
rimeiro
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
            callback_url: `https://checkout.webelieveinghosts.com.br/${payment.id}/callback`,
            notification_url: `https://checkout.webelieveinghosts.com.br/${payment.id}/notification`,
            statement_descriptor: "WBG",
        }

        // ✅ Se for PIX
        if (isPix) {
            paymentBody.payment_method_id = "pix"
        }
        // ✅ Se for cartão
        else if (cardFormData) {
            // Validar se cardFormData tem as propriedades necessárias
            if (!cardFormData.token) {
                throw new Error("Token do cartão não encontrado")
            }

            if (!cardFormData.payment_method_id) {
                throw new Error("Método de pagamento não encontrado")
            }

            if (!cardFormData.issuer_id) {
                throw new Error("Issuer ID não encontrado")
            }

            // Adicionar informações do cartão
            paymentBody.payment_method_id = cardFormData.payment_method_id
            paymentBody.token = cardFormData.token
            paymentBody.issuer_id = cardFormData.issuer_id

            // ✅ PARCELAMENTO: Limitar a no máximo 3 parcelas
            const requestedInstallments = cardFormData.installments || 1
            paymentBody.installments = Math.min(requestedInstallments, 3)

            // Adicionar informações do pagador se disponível
            if (cardFormData.payer) {
                paymentBody.payer = {
                    ...paymentBody.payer,
                    ...cardFormData.payer
                }
            }
        } else {
            throw new Error("Dados de pagamento incompletos")
        }

        const { id, point_of_interaction } = await (payment.payment_id ?
            invoice.get({ id: payment.payment_id }) :
            invoice.create({ body: paymentBody }))

        if (!payment.payment_id) await updatePayment(payment.id, id!.toString())

        return isPix ? {
            copyAndPaste: point_of_interaction!.transaction_data!.qr_code,
            image: point_of_interaction!.transaction_data!.qr_code_base64
        } : undefined

    } catch (error) {
        console.error("Erro ao criar pagamento:", error)
        throw error
    }
}

// ✅ Função getPaymentById (necessária para notification/route.ts)
export const getPaymentById = async (paymentId: string) => {
    try {
        const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN!, options: { timeout: 30000 } })
        const invoice = new Payment(client)
        const result = await invoice.get({ id: paymentId })
        return result
    } catch (error) {
        console.error("Erro ao buscar pagamento:", error)
        throw error
    }
}
