import { z } from "zod";

export const screenshotFormSchema = z.object({
    url: z.url(),
});
