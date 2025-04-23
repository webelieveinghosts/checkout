import { BadgeDollarSignIcon, BoxIcon, CheckIcon, ChevronRight, PackageOpenIcon, ShoppingBasketIcon } from "lucide-react"
import { Logo } from "../logo/logo"

export const Navbar = ({ action = "details" }: { action: "details" | "payment" }) => {
    return (
        <div className="flex flex-col items-center border-b border-b-zinc-100 py-4 sm:flex-row sm:px-10 lg:px-20 xl:px-32">
            <Logo className="w-12" />
            <div className="mt-4 py-2 text-xs sm:mt-0 sm:ml-auto sm:text-base">
                <div className="relative">
                    <ul className="relative flex w-full items-center justify-between space-x-2 sm:space-x-4">
                        <li className="flex items-center space-x-3 text-left sm:space-x-4">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-semibold text-emerald-700">
                                <ShoppingBasketIcon size={16} />
                            </div>

                            <span className="font-semibold text-gray-900">Carrinho</span>
                        </li>

                        <ChevronRight className="text-gray-400" size={16} />

                        {action === "details" ? <>
                            <li className="flex items-center space-x-3 text-left sm:space-x-4">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white ring ring-gray-600 ring-offset-2">
                                    <BoxIcon size={16} />
                                </div>
                                <span className="font-semibold text-gray-900">Entrega</span>
                            </li>

                            <ChevronRight className="text-gray-400" size={16} />

                            <li className="flex items-center space-x-3 text-left sm:space-x-4">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white">
                                    <BadgeDollarSignIcon size={16} />
                                </div>
                                <span className="font-semibold text-gray-500">Pagamento</span>
                            </li>
                        </> : <><li className="flex items-center space-x-3 text-left sm:space-x-4">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-semibold text-emerald-700">
                                <BoxIcon size={16} />
                            </div>
                            <span className="font-semibold text-gray-900">Entrega</span>
                        </li>

                        <ChevronRight className="text-gray-400" size={16} />

                        <li className="flex items-center space-x-3 text-left sm:space-x-4">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white ring ring-gray-600 ring-offset-2">
                                <BadgeDollarSignIcon size={16} />
                            </div>
                            <span className="font-semibold text-gray-500">Pagamento</span>
                        </li>
                        </>}
                    </ul>
                </div>
            </div>
        </div>
    )
}