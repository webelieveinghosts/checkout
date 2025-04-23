import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getPaymentById } from "@/supabase/admin"
import { Navbar } from "@/components/navbar/navbar"
import { createPayment } from "@/mercadopago/payment"
import { CartItem } from "@/supabase/client"
import { Payment } from "@/components/payment/payment"

const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BRL",
    currencyDisplay: "narrowSymbol"
})

export default async function PaymentPage({ params }: { children: ReactNode, params: Promise<{ id: string }> }) {
    const { id } = await params
    const payment = await getPaymentById(id)

    if (!payment || payment.status !== "pending")
        return redirect("https://www.webelieveinghosts.com.br/")

    const paymentData = payment.method === "pix" && await createPayment(payment)

    const total = (payment.cart as CartItem[]).reduce((sum, { price }) => sum + price, 0)

    return (
        <>
            <Navbar action="payment" />
            <div className="flex justify-center w-full h-full">
                <div className="max-w-5xl mt-4 md:mt-10">
                    <h2 className="text-2xl font-bold">Pagamento via {payment.method === "pix" ? "Pix" : "Cartão de Crédito"}</h2>

                    <div className=" mt-4 flex flex-col gap-4 md:flex-row md:items-start md:gap-6 bg-gray-100 rounded p-3">
                        {payment.method === "pix" && paymentData ?
                            <picture className="container w-80 h-80" >
                                <img className="rounded bg-white" src={`data:image/jpeg;charset=utf-8;base64,${paymentData.image}`} alt="QR Code" />
                            </picture> :
                            <Payment payment={payment} />
                        }

                        <div className="flex flex-col justify-between items-start h-80">
                            {payment.method === "pix" && paymentData && <div className="mb-4">
                                <h1 className="text-start align-top font-bold text-base">Escaneie o QR Code para efetuar o pagamento.</h1>
                                <div className="flex w-full mt-2">
                                    <input type="text" defaultValue={paymentData.copyAndPaste} className="w-full h-10 bg-gray-200 rounded-l px-2 outline-none" readOnly />
                                    <button className="bg-primary w-20 h-10 text-white text-xs font-semibold uppercase rounded-r">copiar</button>
                                </div>
                            </div>}

                            <div className="sm:mt-8 lg:mt-0 w-full mt-auto">
                                <div className="space-y-4 rounded bg-gray-200 p-4 w-full">
                                    <div className="space-y-2">
                                        <dl className="flex items-center justify-between gap-4">
                                            <dt className="text-base font-normal">Valor original</dt>
                                            <dd className="text-base font-medium">{formatter.format(total)}</dd>
                                        </dl>

                                        <dl className="flex items-center justify-between gap-4">
                                            <dt className="text-base font-normal">Entrega</dt>
                                            <dd className="text-base font-medium">{formatter.format(payment.total - total)}</dd>
                                        </dl>
                                    </div>

                                    <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                                        <dt className="text-base font-bold">Total</dt>
                                        <dd className="text-base font-bold">{formatter.format(payment.total)}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}