"use server"

import { MercadoPagoConfig, Payment } from "mercadopago"
import { Database } from "@/supabase/database"
import { updatePayment } from "@/supabase/admin"
import { ICardPaymentBrickPayer, ICardPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/cardPayment/type"

const client = new MercadoPagoConfig({ accessToken: process.env.ACCESS_TOKEN!, options: { timeout: 5000 } })

export const createPayment = async (payment: Database["public"]["Tables"]["transactions"]["Row"], cardFormData?: ICardPaymentFormData<ICardPaymentBrickPayer>) => {
    const { name, cpf, email, phone } = payment.summary_information as any
    const fullName = name.split(" ") as string[]

    const invoice = new Payment(client)
    const { id, point_of_interaction } = await (payment.payment_id ? invoice.get({ id: payment.payment_id }) : invoice.create({
        body: {
            transaction_amount: payment.total,
            description: "Pagamento WBG.",
            payment_method_id: payment.method === "pix" ? "pix" : cardFormData?.payment_method_id,
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
            token: cardFormData?.token
        }
    }))

    if (!payment.payment_id) await updatePayment(payment.id, id!.toString())
    return payment.method === "pix" ? { copyAndPaste: point_of_interaction!.transaction_data!.qr_code, image: point_of_interaction!.transaction_data!.qr_code_base64 } : {  }
}