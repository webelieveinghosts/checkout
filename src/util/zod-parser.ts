import { z } from "zod"

export const validationSchema = z.strictObject({
    cpf: z.string({
        required_error: "CPF é obrigatório.",
    }).refine(doc => {
        const replacedDoc = doc.replace(/\D/g, "")
        return replacedDoc.length != 11;
    }, "CPF deve conter 11 caracteres.")
        .refine(doc => {
            const replacedDoc = doc.replace(/\D/g, "")
            return !!Number(replacedDoc)
        }, "CPF deve conter apenas números.")
})