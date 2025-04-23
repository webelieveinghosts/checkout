"use client"

import { Database } from "@/supabase/database"
import { useState } from "react"
import { useCheckout } from "@/components/provider/checkout-provider"
import { createPaymentCart } from "@/supabase/admin"
import { redirect, useParams } from "next/navigation"
import LoadingDots from "@/components/loading-dots/loading-dots"
import { getDeliveryPrice } from "@/melhorenvio/delivery"
import cn from "clsx"

const parse = (size: Database["public"]["Enums"]["size"]) => {
    switch (size) {
        case "small":
            return "P"
        case "medium":
            return "M"
        case "large":
            return "G"
        case "extra_large":
            return "GG"
    }
}

const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BRL",
    currencyDisplay: "narrowSymbol"
})

const CPF_REGEX = /^([-\.\s]?(\d{3})){3}[-\.\s]?(\d{2})$/
const NUMBER_REGEX = /^\(?\d{2}\) \d{5}-\d{4}$/
const EMAIL_REGEX = /^\S+@\S+\.\S+$/

export const OrderSummary = () => {
    const context = useCheckout()
    const [paymentMethod, setPaymentMethod] = useState<"pix" | "creditcard">("pix")
    const [isSubmitting, setSubmitting] = useState(false)

    const delivery = context.getDeliveryOption()
    const items = context.getItems(), total = context.getTotal()

    const { id } = useParams()
    const handlePayment = async () => {
        setSubmitting(true)

        const name = (document.getElementById("name") as HTMLInputElement).value,
            cpf = (document.getElementById("cpf") as HTMLInputElement).value,
            email = (document.getElementById("email") as HTMLInputElement).value,
            phone = (document.getElementById("phone") as HTMLInputElement).value

        if (name.includes(" ") && EMAIL_REGEX.test(email) && CPF_REGEX.test(cpf) && NUMBER_REGEX.test(phone)) {
            const zipcode = (document.getElementById("zipcode") as HTMLInputElement).value.replaceAll(/\D/g, ""),
                number = Number((document.getElementById("number") as HTMLInputElement).value),
                address = (document.getElementById("address") as HTMLInputElement).value,
                complement = (document.getElementById("complement") as HTMLInputElement).value,
                neighborhood = (document.getElementById("neighborhood") as HTMLInputElement).value,
                city = (document.getElementById("city") as HTMLInputElement).value,
                state = (document.getElementById("state") as HTMLInputElement).value

            if (delivery > 0 && (zipcode.length != 8 || address.length < 10 || neighborhood.length < 6 || city.length < 5 || state.length != 2)) {
                setSubmitting(false)
                return alert("Os dados de entrega estão fora do padrão ou não foram preenchidos corretamente.")
            }

            const data = delivery === 0 ? {} : { delivery, zipcode, number, address, complement, neighborhood, city, state }
            const value = delivery === 0 ? total : total + (await getDeliveryPrice(items, zipcode, delivery))

            const paymentId = await createPaymentCart(items, data, { name, cpf, email, phone }, value, paymentMethod)
            redirect(`/${paymentId}/payment`)
        } else alert("Os dados pessoais estão fora do padrão ou não foram preenchidos corretamente.")

        setSubmitting(false)
    }

    return (
        <div className="flex flex-col justify-between p-4 rounded bg-gray-50" style={{ maxHeight: "471px" }}>
            <div className="">
                <p className="text-base font-semibold">Suas compras</p>

                <ul className="grow overflow-auto mt-2 rounded">
                    {items.sort((a, b) => a.name.localeCompare(b.name)).map((item, i) => {
                        return (
                            <li key={i} className="flex w-full flex-col pb-2">
                                <div className="relative flex w-full flex-row justify-between">
                                    <div className="flex flex-row space-x-4">
                                        <div className="relative h-16 w-16 cursor-pointer overflow-hidden rounded border border-gray-300 bg-gray-300">
                                            <img
                                                className="h-full w-full object-cover"
                                                width={64}
                                                height={64}
                                                alt={item.name}
                                                src={`https://lhlpxtxqdlctohptywpi.supabase.co/storage/v1/object/public/products/${item.productId}/${item.image}`}
                                            />
                                        </div>

                                        <div className="flex flex-1 flex-col justify-end">
                                            <span className="leading-tight font-medium capitalize">
                                                {item.name}
                                            </span>
                                            <div>
                                                {item.size && <span className="text-xs text-gray-500 font-semibold">
                                                    Tamanho: {parse(item.size)}
                                                </span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex h-16 flex-col justify-between">
                                        <p suppressHydrationWarning={true} className="flex justify-end text-right font-semibold mt-auto">
                                            {`${formatter.format(item.price)}`}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>

            <div>
                <div className="border-t border-b border-gray-300 py-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Valor total</p>
                        <p id="total-items" className="font-semibold">{formatter.format(total)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Frete</p>
                        <p id="delivery-fee" className="font-semibold">R$ 0,00</p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm font-medium">Total</p>
                    <p id="total-value" className="text-2xl font-semibold">{formatter.format(total)}</p>
                </div>

                <div className="mt-5 flex flex-col">
                    <p className="font-semibold">Opções de Pagamento</p>
                    <form className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 h-12">
                        <div className={cn("flex items-center cursor-pointer select-none rounded bg-gray-100 border px-4 transition-all duration-500 hover:bg-gray-200", {
                            "border-primary": paymentMethod === "pix",
                            "border-transparent": paymentMethod !== "pix",
                        })} onClick={() => setPaymentMethod("pix")}>
                            <span className="font-semibold">Pix</span>
                        </div>
                        <div className={cn("flex items-center cursor-pointer select-none rounded bg-gray-100 border px-4 transition-all duration-500 hover:bg-gray-200", {
                            "border-primary": paymentMethod === "creditcard",
                            "border-transparent": paymentMethod !== "creditcard",
                        })} onClick={() => setPaymentMethod("creditcard")}>
                            <span className="font-semibold">Cartão de Crédito</span>
                        </div>
                    </form>
                </div>

                <button className="mt-4 w-full rounded bg-primary px-6 py-3 font-medium text-white cursor-pointer transition-all duration-500 hover:bg-primary-hover disabled:bg-primary-hover" onClick={handlePayment} disabled={isSubmitting}>{isSubmitting ? <LoadingDots /> : "Finalizar Compra"}</button>
            </div>
        </div >
    )
}