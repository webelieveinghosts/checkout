import { DeliveryOptions } from "@/components/delivery-options/develiry-options"
import { Navbar } from "@/components/navbar/navbar"
import { OrderSummary } from "@/components/order-summary/order-summary"
import { CheckoutProvider } from "@/components/provider/checkout-provider"
import { SummaryInformation } from "@/components/summary-information/summary-infomation"
import { getCart } from "@/supabase/client"
import { redirect } from "next/navigation"

export default async function Home({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cart = await getCart(id)

    if (!cart || cart.length === 0)
        return redirect("https://wbg.wtf/")

    return (
        <CheckoutProvider items={cart}>
            <div className="w-full h-screen overflow-y-auto">
                <Navbar action="details" />
                <div className="grid px-2 sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32 py-4 md:py-8 gap-4">
                    <div>
                        <SummaryInformation />
                        <DeliveryOptions />
                    </div>

                    <OrderSummary />
                </div>
            </div>
        </CheckoutProvider>
    )
}