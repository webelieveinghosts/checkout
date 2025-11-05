import { Navbar } from "@/components/navbar/navbar"
import { getPaymentById } from "@/supabase/admin"
import { redirect } from "next/navigation"

export default async function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const payment = await getPaymentById(id)

    if (!payment)
        return redirect("https://wbg.wtf/")

    if (payment.status != "paid")
        return redirect(`/${id}/payment`)

    return (
        <>
            <Navbar action="success" />
            <div className="flex items-center jsutify-center w-full h-[calc(100vh_-_5rem)]">
                <div className="bg-zinc-100 p-6 rounded-lg mx-auto">
                    <svg viewBox="0 0 24 24" className="text-green-500 w-16 h-16 mx-auto my-6">
                        <path fill="currentColor"
                            d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z">
                        </path>
                    </svg>

                    <div className="text-center">
                        <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center">Pagamento Concluido!</h3>
                        <p className="text-gray-600 my-2">Obrigado por concluir seu pagamento online com segurança.</p>
                        <p> Tenha um ótimo dia! </p>
                        <div className="py-10 text-center">
                            <a href="https://wbg.wtf/" className="px-12 bg-primary hover:bg-primary-hover text-white font-semibold py-3 transition-all duration-500">
                                VOLTAR A LOJA
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}