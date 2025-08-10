import Link from "next/link";

export default function FAQ() {
    const faq = [
        {
            question: "What is TakeScreenshot.app?",
            answer: (
                <>
                    <Link href="/">TakeScreenshot.app</Link> is one of the best
                    tools that allows you to take a screenshot of a website
                    online without installing any software, signing up and for
                    free.
                </>
            ),
            link: "/",
            label: "TakeScreenshot.app",
        },
        {
            question: "How to perform full page screen capture?",
            answer: (
                <>
                    To take a full-page website screenshot with{" "}
                    <Link href="/">TakeScreenshot.app</Link> select the
                    &quot;full page&quot; checkbox and then click on the
                    &quot;Render&quot; button.
                </>
            ),
            link: "/posts/full-page-website-screenshots",
            label: "Read more about full-page screenshots",
        },
        {
            question: "How to take a screenshot of a website by a link?",
            answer: (
                <>
                    To take a screenshot of a website by a link, you can use the{" "}
                    <Link href="/">TakeScreenshot.app</Link> and enter the URL
                    of the website you want to screenshot, and then click on the
                    &quot;Render&quot; button.
                </>
            ),
            link: "/posts/take-screenshot-by-link",
            label: "Read more about taking a screenshot by a link",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-4 bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                {faq.map((item) => (
                    <div className="flex flex-col gap-2" key={item.question}>
                        <h3 className="text-md font-semibold">
                            {item.question}
                        </h3>
                        <p className="text-sm text-gray-500">{item.answer}</p>
                        <a
                            href={item.link}
                            className="text-sm text-blue-500 underline hover:text-blue-600 hover:no-underline"
                        >
                            {item.label} &rarr;
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
