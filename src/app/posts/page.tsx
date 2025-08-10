import { allPosts } from "content-collections";
import FAQ from "@/components/faq";
import Image from "next/image";

export default function Posts() {
    return (
        <div className="mx-auto flex flex-col gap-16 items-center justify-center">
            <div className="gap-4 bg-white rounded-lg shadow p-8">
                <div>
                    <h1 className="text-xl font-bold">Resources</h1>
                    <p className="text-sm text-gray-500">
                        On everything related to website screenshots.
                    </p>
                </div>
                <ul className="mt-8 flex flex-row flex-wrap gap-8">
                    {allPosts.map((post) => (
                        <li key={post._meta.path} className="max-w-96">
                            <a
                                href={`/posts/${post._meta.path}`}
                                className="flex flex-col gap-2"
                            >
                                {post.image && (
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        width={1024}
                                        height={1024}
                                        className="w-full rounded-lg"
                                    />
                                )}
                                <h2 className="text-lg font-bold text-balance">
                                    {post.title}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {post.summary}
                                </p>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <FAQ />
        </div>
    );
}
