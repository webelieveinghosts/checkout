"use server"

import { CartItem } from "@/supabase/client"

export const getAddressInfo = async (cep: string) => {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(response => response.json()).catch(() => { })
        if (!response || response.erro) return undefined

        return {
            address: response.logradouro as string,
            complement: response.complemento as string,
            neighborhood: response.bairro as string,
            city: response.localidade as string,
            state: response.uf as string
        }
    } catch (ignore) { }

    return undefined
}

export const calculateDelivery = async (items: CartItem[], to: string) => {
    const response = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/calculate", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Aplicação (contato.webelieveinghosts@gmail.com)",
            "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        },
        body: JSON.stringify({
            from: {
                "postal_code": "88062300"
            },
            to: {
                "postal_code": to
            },
            products: items.map(item => {
                const moletom = item.name.toLowerCase().includes("moletom")

                return {
                    id: item.productId,
                    width: (moletom ? 30 : 31),
                    height: (moletom ? 43 : 20),
                    length: (moletom ? 10 : 8),
                    weight: (moletom ? 0.72 : 0.27),
                    "insurance_value": item.price,
                    quantity: 1
                }
            }),
            options: {
                receipt: false,
                "own_hand": false
            },
            services: "1,2,3,4"
        })
    }).then(response => response.json())

    return response.errors ? undefined : (response as any[]).filter(option => option.delivery_time)
}

export const getDeliveryPrice = async (items: CartItem[], to: string, id: number) => {
    const response = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/calculate", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Aplicação (contato.webelieveinghosts@gmail.com)",
            "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        },
        body: JSON.stringify({
            from: {
                "postal_code": "88062300"
            },
            to: {
                "postal_code": to
            },
            products: items.map(item => {
                const moletom = item.name.toLowerCase().includes("moletom")

                return {
                    id: item.productId,
                    width: (moletom ? 30 : 31),
                    height: (moletom ? 43 : 20),
                    length: (moletom ? 10 : 8),
                    weight: (moletom ? 0.72 : 0.27),
                    "insurance_value": item.price,
                    quantity: 1
                }
            }),
            options: {
                receipt: false,
                "own_hand": false
            },
            services: id
        })
    }).then(response => response.json())

    return response.errors ? 0 : Number(response.price) - Number(response.discount)
}