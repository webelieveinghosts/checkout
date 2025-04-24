"use client"

export const Clipboard = ({ value }: { value: string }) => (<button className="bg-primary w-20 h-10 text-white text-xs font-semibold uppercase rounded-r" onClick={() => navigator.clipboard.writeText(value)}>copiar</button>)