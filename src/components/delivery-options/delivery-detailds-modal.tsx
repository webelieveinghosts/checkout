"use client"

import { useEffect, useState } from "react"
import { calculateDelivery, getAddressInfo } from "@/melhorenvio/delivery"
import { CartItem } from "@/supabase/client"
import { HashIcon, MailboxIcon, MapPinHouseIcon, XIcon } from "lucide-react"
import cn from "clsx"
import { useCheckout } from "../provider/checkout-provider"

const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BRL",
    currencyDisplay: "narrowSymbol"
})

export const DeliveryDetailds = ({ show, close, items, handleDelivery }: { show: boolean, close: () => void, items: CartItem[], handleDelivery: (company?: string, time?: number) => void }) => {
    const [cep, setCEP] = useState("")
    const [selected, setSelected] = useState<any>()
    const [options, setOptions] = useState<any[]>()

    const [address, setAddress] = useState("")
    const [number, setNumber] = useState<number>()
    const [complement, setComplement] = useState("")
    const [neighborhood, setNeighborhood] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")

    const handleCEP = async () => {
        const details = await getAddressInfo(cep.replaceAll(/^\D+/g, ""))
        if (!details) return

        setAddress(details.address)
        setComplement(details.complement)
        setNeighborhood(details.neighborhood)
        setCity(details.city)
        setState(details.state)
    }

    const handleOptions = async () => {
        const options = await calculateDelivery(items, cep)
        setOptions(options)
        if (!options) setSelected(undefined)
    }

    useEffect(() => {
        if (cep.length === 8)
            setCEP(cep.replace(/^(\d{5})(\d{3}).*/, "$1-$2"))

        if (cep.length === 9) {
            handleCEP()
            handleOptions()
        } else {
            handleDelivery()
            setOptions(undefined)
        }
    }, [cep])

    const { setDeliveryOption } = useCheckout()

    useEffect(() => {
        if (selected) {
            setDeliveryOption(selected.id)
            handleDelivery(selected.name, selected.delivery_time)

            const itemsTotal = Number(document.getElementById("total-items")!.innerHTML.replace("R$", ""))
            const deliveryFee = Number(selected.price) - Number(selected.discount)

            document.getElementById("delivery-fee")!.innerHTML = formatter.format(deliveryFee)
            document.getElementById("total-value")!.innerHTML = formatter.format(itemsTotal + deliveryFee)
        }
        else
            handleDelivery()
    }, [selected])

    return (
        <div className={cn("fixed w-full h-screen top-0 left-0 z-10", {
            "hidden": !show
        })}>
            <div className="absolute bg-black opacity-80 w-full h-screen -z-10" />

            <div className="flex items-center justify-center w-full h-screen px-3 md:px-0">
                <div className="max-w-[40rem] rounded bg-gray-100 p-4 mt-4 transition-all duration-500">
                    <div className="flex items-center justify-between border-b border-b-gray-200 pb-4">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold leading-6">Entrega</h1>
                        </div>

                        <XIcon className="cursor-pointer transition-all duration-500 hover:opacity-80" onClick={close} />
                    </div>

                    <div className="space-y-3">
                        <div className="hidden md:flex space-x-2 w-full">
                            <div className="w-1/3">
                                <label form="zipcode" className="mt-4 mb-1 block text-xs font-bold">CEP</label>
                                <div className="relative">
                                    <input type="tel" id="zipcode" name="zipcode" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="12345-000" value={cep} onChange={event => {
                                        const value = event.currentTarget.value
                                        if (value.length <= 0)
                                            setCEP("")

                                        if (Number(value))
                                            setCEP(value)

                                        if (value.length < cep.length)
                                            setCEP(value)
                                    }} />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                        <MailboxIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-2/3">
                                <label form="address" className="mt-4 mb-1 block text-xs font-bold">Endereço</label>
                                <div className="relative">
                                    <input type="text" id="address" name="address" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="Rua, Avenida, Alameda" value={address} onChange={event => setAddress(event.currentTarget.value)} />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                        <MapPinHouseIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-1/4">
                                <label form="number" className="mt-4 mb-1 block text-xs font-bold">Número</label>
                                <div className="relative">
                                    <input type="tel" id="number" name="number" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="237" value={number} onChange={event => {
                                        const value = Number(event.currentTarget.value)
                                        if (!value || value > 99999) return

                                        setNumber(value)
                                    }} />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                        <HashIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex md:hidden space-x-2 w-full">
                            <div className="w-1/2">
                                <label form="zipcode" className="mt-4 mb-1 block text-xs font-bold">CEP</label>
                                <div className="relative">
                                    <input type="zipcode" id="zipcode" name="zipcode" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="12345-000" value={cep} onChange={event => setCEP(event.currentTarget.value)} maxLength={8} />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                        <MailboxIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-1/2">
                                <label form="number" className="mt-4 mb-1 block text-xs font-bold">Número</label>
                                <div className="relative">
                                    <input type="number" id="number" name="number" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="237" />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                        <HashIcon className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:hidden">
                            <label form="address" className="mt-4 mb-1 block text-xs font-bold">Endereço</label>
                            <div className="relative">
                                <input type="text" id="address" name="address" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="Rua, Avenida, Alameda" value={address} onChange={event => setAddress(event.currentTarget.value)} />
                                <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                    <MapPinHouseIcon className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2 w-full">
                            <div className="w-1/2">
                                <label form="complement" className="mt-4 mb-1 block text-xs font-bold">Complemento</label>
                                <div className="relative">
                                    <input type="text" id="complement" name="complement" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="Apartamento, unidade, prédio, casa" value={complement} onChange={event => setComplement(event.currentTarget.value)} />
                                </div>
                            </div>

                            <div className="w-1/2">
                                <label form="neighborhood" className="mt-4 mb-1 block text-xs font-bold">Bairro</label>
                                <div className="relative">
                                    <input type="text" id="neighborhood" name="neighborhood" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="Centro" value={neighborhood} onChange={event => setNeighborhood(event.currentTarget.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2 w-full">
                            <div className="w-1/2">
                                <label form="city" className="mt-4 mb-1 block text-xs font-bold">Cidade</label>
                                <div className="relative">
                                    <input type="text" id="city" name="city" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="Cidade" value={city} onChange={event => setCity(event.currentTarget.value)} />
                                </div>
                            </div>

                            <div className="w-1/2">
                                <label form="state" className="mt-4 mb-1 block text-xs font-bold">Estado</label>
                                <div className="relative">
                                    <select id="state" name="state" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" value={state} onChange={event => setState(event.currentTarget.value)}>
                                        <option value=""> Selecione</option>
                                        <option value="AC">Acre</option>
                                        <option value="AL">Alagoas</option>
                                        <option value="AP">Amapá</option>
                                        <option value="AM">Amazonas</option>
                                        <option value="BA">Bahia</option>
                                        <option value="CE">Ceará</option>
                                        <option value="DF">Distrito Federal</option>
                                        <option value="ES">Espírito Santo</option>
                                        <option value="GO">Goiás</option>
                                        <option value="MA">Maranhão</option>
                                        <option value="MT">Mato Grosso</option>
                                        <option value="MS">Mato Grosso do Sul</option>
                                        <option value="MG">Minas Gerais</option>
                                        <option value="PA">Pará</option>
                                        <option value="PB">Paraíba</option>
                                        <option value="PR">Paraná</option>
                                        <option value="PE">Pernambuco</option>
                                        <option value="PI">Piauí</option>
                                        <option value="RJ">Rio de Janeiro</option>
                                        <option value="RN">Rio Grande do Norte</option>
                                        <option value="RS">Rio Grande do Sul</option>
                                        <option value="RO">Rondônia</option>
                                        <option value="RR">Roraima</option>
                                        <option value="SC">Santa Catarina</option>
                                        <option value="SP">São Paulo</option>
                                        <option value="SE">Sergipe</option>
                                        <option value="TO">Tocantins</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {options && <div className="pt-4 max-h-80">
                        <h1 className="text-base font-bold pb-4">Opções</h1>
                        <div className="grid grid-cols-2">
                            {options.map(option =>
                                <div key={option.name} className={cn("flex w-full cursor-pointer select-none rounded bg-gray-100 border p-4 transition-all duration-500 hover:bg-gray-200", {
                                    "border-primary bg-gray-200": selected?.name === option.name,
                                    "border-transparent": selected?.name !== option.name,
                                })} onClick={() => setSelected(option)}>
                                    <div>
                                        <span className="mt-2 font-semibold">{option.name}</span>
                                        <p className="text-slate-500 text-xs leading-4">Custo: {formatter.format(Number(option.price) - Number(option.discount))}</p>
                                        <p className="text-slate-500 text-xs leading-4">Tempo estimado: {15 + option.delivery_time} dias</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    )
}