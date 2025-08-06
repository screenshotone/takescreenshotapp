TakeScreenshot.app is a simple app that allows to take screenshots of websites online for free and without any registration.

It supports the following parameters when rendering the screenshot:

1. Image format: JPEG, PNG or WebP.
2. Image quality: Low, Medium, High.
3. Device scale factor: 1, 2, 3.
4. Block banners: Yes or No.
5. Block ads: Yes or No.
6. Use cache: Yes or No.
7. Viewport width.
8. Viewport height.

Clicking on the render button should create a screenshot in the database with status "new" and render the screenshot and redirect to the dedicated page with the screenshot.

On the dedicated page, it should show the screenshot, the metadata related to it, and a button to download the screenshot.

While it waits for the screenshot to be rendered, it should show a loading spinner and a message that the screenshot is being rendered.

It also should render human readable error from the ScreenshotOne API (SDK): https://screenshotone.com/docs/guides/how-to-handle-api-errors/.

Also:

1. It uses ScreenshotOne API via SDK to render the screenshots.
2. It stores screenshots via ScreenshotOne API in the S3 compatible storage like Cloudflare R2.
3. It uses Drizzle ORM to store the screenshots in the database, their links, and their statuses.
4. It renders last 3 screenshots on the main page and has a link to more, where it render every screenshot.
5. There is simple pagination on the more page.
6. Each screenshot leads to a dedicated page with the screenshot with metadata related to it.

Stack:

The project is built with [Next.js](https://nextjs.org/), [shadcn/ui](https://ui.shadcn.com/), [Drizzle ORM](https://orm.drizzle.team/), [Tailwind CSS](https://tailwindcss.com/) and [ScreenshotOne](https://screenshotone.com/).

It uses SQLite as a database.
