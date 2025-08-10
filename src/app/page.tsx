import ScreenshotForm from "@/components/screenshot-form";
import FAQ from "@/components/faq";

export default function Home() {
    return (
        <div className="mx-auto flex flex-col gap-16 items-center justify-center">
            <div className="max-w-lg mx-auto flex flex-col gap-4 bg-white rounded-lg shadow p-8">
                <ScreenshotForm />
            </div>
            <FAQ />
        </div>
    );
}
