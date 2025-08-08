import { allPosts } from "content-collections";

export default function Posts() {
    return (
        <div className="w-full gap-4 bg-white rounded-lg shadow p-8">
            <div>
                <h1 className="text-xl font-bold">Resources</h1>
                <p className="text-sm text-gray-500">
                    On everything related to website screenshots.
                </p>
            </div>
            <ul className="mt-8 flex flex-col gap-4">
                {allPosts.map((post) => (
                    <li key={post._meta.path}>
                        <a href={`/posts/${post._meta.path}`}>
                            <h2 className="text-lg font-bold">{post.title}</h2>
                            <p className="text-sm text-gray-500">
                                {post.summary}
                            </p>
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
