import { z } from "zod";

export const screenshotFormSchema = z.object({
    url: z
        .string()
        .trim()
        .min(1, { message: "URL is required" })
        .transform((val) => {
            if (!/^https?:\/\//i.test(val)) {
                return `https://${val}`;
            }
            return val;
        })
        .refine(
            (val) => {
                try {
                    const url = new URL(val);
                    return !!url.hostname;
                } catch {
                    return false;
                }
            },
            { message: "Invalid URL" }
        ),
    device: z.enum(["desktop", "mobile"]).optional(),
    fullPage: z.boolean().optional(),
});
