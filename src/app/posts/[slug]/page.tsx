import { allPosts } from "content-collections";
import { notFound } from "next/navigation";
import FAQ from "@/components/faq";

export default async function PostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = allPosts.find((post) => post._meta.path === slug);

    if (!post) {
        return notFound();
    }

    return (
        <div className="mx-auto flex flex-col gap-16 items-center justify-center">
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 bg-white rounded-lg shadow p-8">
                <h1 className="text-5xl font-bold">{post.title}</h1>
                <article
                    className="prose lg:prose-xl"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>
            <FAQ />
        </div>
    );
}
