import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import { compileMarkdown } from "@content-collections/markdown";

const posts = defineCollection({
    name: "posts",
    directory: "src/posts",
    include: "**/*.md",
    schema: z.object({
        title: z.string(),
        summary: z.string(),
        image: z.string().optional(),
    }),
    transform: async (document, context) => {
        const content = await compileMarkdown(context, document);

        return {
            ...document,
            content,
        };
    },
});

export default defineConfig({
    collections: [posts],
});
