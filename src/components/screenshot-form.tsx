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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";

export default function ScreenshotForm() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();
    const form = useForm<z.infer<typeof screenshotFormSchema>>({
        resolver: zodResolver(screenshotFormSchema),
        defaultValues: {
            url: "",
            device: "desktop",
            fullPage: false,
        },
    });

    async function onSubmit(values: z.infer<typeof screenshotFormSchema>) {
        try {
            const response = await fetch("/api/screenshot", {
                method: "POST",
                body: JSON.stringify({
                    url: values.url,
                    device: values.device,
                    fullPage: values.fullPage,
                }),
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                Enter the URL of a page to render a screenshot.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="device"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Device</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a device" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desktop">
                                            Desktop{" "}
                                            <span className="text-xs text-muted-foreground">
                                                (1920x1080)
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="mobile">
                                            Mobile{" "}
                                            <span className="text-xs text-muted-foreground">
                                                (iPhone X)
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormDescription>
                                Choose the browser viewport size.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fullPage"
                    render={({ field }) => (
                        <FormItem className="flex flex-row gap-2 items-center">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel>Full page</FormLabel>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end">
                    <Button type="submit">Render →</Button>
                </div>
            </form>
        </Form>
    );
}
