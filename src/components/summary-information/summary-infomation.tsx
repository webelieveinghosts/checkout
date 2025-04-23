"use client"

import { useEffect, useState } from "react"
import { Columns4Icon, MailIcon, PhoneIcon, User2Icon } from "lucide-react"

export const SummaryInformation = () => {
    const [cpf, setCPF] = useState("")
    const [tel, setTel] = useState("")

    useEffect(() => {
        if (cpf.length >= 11)
            setCPF(cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4"))
    }, [cpf])

    useEffect(() => {
        if (tel.length >= 10)
            setTel(tel.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3"))
    }, [tel])

    return (
        <div className="bg-gray-50 rounded p-4">
            <p className="text-base font-semibold">Informações pessoais</p>
            <p className="text-xs text-gray-400">Conclua seu pedido fornecendo suas informações.</p>
            <div className="space-y-3">
                <div className="flex space-x-2 w-full">
                    <div className="w-1/2">
                        <label form="name" className="mt-4 mb-1 block text-xs font-bold">Nome completo</label>
                        <div className="relative">
                            <input type="text" id="name" name="name" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="WBG Store" required />
                            <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                <User2Icon className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="w-1/2">
                        <label form="cpf" className="mt-4 mb-1 block text-xs font-bold">CPF</label>
                        <div className="relative">
                            <input type="tel" id="cpf" name="cpf" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="999.999.999-99" value={cpf} onChange={event => {
                                const value = event.currentTarget.value
                                if (value.length <= 0)
                                    setCPF("")

                                if (Number(value) >= 0)
                                    setCPF(value)

                                if (value.length < cpf.length)
                                    setCPF(value)
                            }} required />
                            <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                                <Columns4Icon className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label form="email" className="mt-4 mb-1 block text-xs font-bold">Email</label>
                    <div className="relative">
                        <input type="email" id="email" name="email" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="contact@wbg.com" />
                        <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                            <MailIcon className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div>
                    <label form="phone" className="mt-4 mb-1 block text-xs font-bold">Telefone</label>
                    <div className="relative">
                        <input type="tel" id="phone" name="phone" className="w-full rounded bg-gray-100 border border-gray-200 px-4 py-3 pl-10 text-sm outline-none transition-all duration-500 focus:z-10 focus:border-primary focus:ring-primary" placeholder="(99) 99999-9999" value={tel} onChange={event => {
                            const value = event.currentTarget.value
                            if (value.length <= 0)
                                setTel("")

                            if (Number(value) >= 0)
                                setTel(value)

                            if (value.length < tel.length)
                                setTel(value)
                        }} />
                        <div className="pointer-events-none absolute inset-y-0 left-0 inline-flex items-center px-3">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}