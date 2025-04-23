"use client"

import { useState } from "react"
import { DeliveryDetailds } from "./delivery-detailds-modal"
import { useCheckout } from "../provider/checkout-provider"
import { PackageCheckIcon, TruckElectricIcon } from "lucide-react"
import cn from "clsx"

export const DeliveryOptions = () => {
    const items = useCheckout().getItems()
    
    const [selected, setSelected] = useState<"withdrawal" | "delivery">()
    const [showModal, setShowModal] = useState(false)

    const [transport, setTransport] = useState<string>()
    const [time, setTime] = useState<number>(0)

    const handleDelivery = async (company?: string, time?: number) => {
        if (!company) {
            setTransport(undefined)
            setTime(0)
            return
        }

        setSelected("delivery")
        setTransport(company)
        setTime(time ?? 0)
    }

    return (
        <>
            <p className="text-lg font-semibold mt-5">Opções de Entrega</p>
            <form className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={cn("flex cursor-pointer select-none rounded bg-gray-100 border p-4 transition-all duration-500 hover:bg-gray-200", {
                    "border-primary": selected === "withdrawal",
                    "border-transparent": selected !== "withdrawal",
                })} onClick={() => setSelected("withdrawal")}>
                    <PackageCheckIcon size={56} strokeWidth={1.3} className={cn("transition-all duration-500", {
                        "text-primary": selected === "withdrawal"
                    })} />
                    <div className="ml-5">
                        <span className="mt-2 font-semibold">Retirada</span>
                        <p className="text-[10px] text-red-400 uppercase font-bold">(Apenas Florianópolis)</p>
                        <p className="text-slate-500 text-sm leading-6">Retirada no local de encontro</p>
                    </div>
                </div>
                <div className={cn("flex cursor-pointer select-none rounded bg-gray-100 border p-4 transition-all duration-500 hover:bg-gray-200", {
                    "border-primary": selected === "delivery",
                    "border-transparent": selected !== "delivery",
                })} onClick={() => setShowModal(true)}>
                    <TruckElectricIcon size={56} strokeWidth={1.3} className={cn("transition-all duration-500", {
                        "text-primary": selected === "delivery"
                    })} />
                    <div className="ml-5">
                        <span className="mt-2 font-semibold">{transport ?? "Entrega"}</span>
                        <p className="text-slate-500 text-sm leading-6">Tempo estimado: {15 + time} dias</p>
                    </div>
                </div>
            </form>

            <DeliveryDetailds show={showModal} close={() => setShowModal(false)} items={items} handleDelivery={handleDelivery} />
        </>
    )
}