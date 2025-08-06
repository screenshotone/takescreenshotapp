"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { screenshotFormSchema } from "@/lib/validations";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScreenshotForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const form = useForm<z.infer<typeof screenshotFormSchema>>({
        resolver: zodResolver(screenshotFormSchema),
        defaultValues: {
            url: "",
        },
    });

    async function onSubmit(values: z.infer<typeof screenshotFormSchema>) {
        try {
            const response = await fetch("/api/screenshot", {
                method: "POST",
                body: JSON.stringify({ url: values.url }),
            });

            const data = await response.json();
            if (response.ok) {
                if (data.url) {
                    setErrorMessage(null);
                    router.push(data.url);
                    return;
                } else {
                    if (data.message) {
                        setErrorMessage(data.message);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setErrorMessage(
                "Failed to render the screenshot. Please, try again."
            );
        }
    }

    return (
        <Form {...form}>
            {errorMessage && (
                <p className="text-destructive-foreground text-sm">
                    {errorMessage}
                </p>
            )}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="https://example.com"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Enter a URL of a page to render a screenshot.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Render</Button>
            </form>
        </Form>
    );
}
