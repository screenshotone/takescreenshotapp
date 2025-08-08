import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function wait(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateUserFriendlyErrorMessage(errorCode: string) {
    switch (errorCode) {
        case "screenshots_limit_reached":
            return "The screenshot rendering is not available. Please, retry later.";
        case "concurrency_limit_reached":
        case "temporary_unavailable":
            return "Please try again in a moment.";
        case "request_not_valid":
            return "Please, make sure your request is valid and try again.";
        case "selector_not_found":
            return "The target element was not found on the page";
        case "name_not_resolved":
            return "Unable to resolve the domain name. Check that there is no typo in the URL. If this is a new site, please wait for DNS propagation.";
        case "network_error":
            return "Unable to connect to the requested URL. The site may be blocking access or temporarily down.";
        case "host_returned_error":
            return `The target website returned an HTTP error. Try again, but if the problem persists, it might be impossible to render this specific website.`;
        case "timeout_error":
            return "The screenshot rendering timed out. Please, try again.";
        case "storage_returned_transient_error":
        case "internal_application_error":
        case "request_aborted":
            return "Failed to render the screenshot. Please try your request again";
        case "access_key_required":
        case "access_key_invalid":
        case "signature_is_required":
        case "signature_is_not_valid":
        case "invalid_storage_configuration":
        case "script_triggers_redirect":
        case "storage_access_denied":
        case "content_contains_specified_string":
        case "invalid_cookie_parameter":
        case "resulting_image_too_large":
            // these are errors that often are not caused by the end user action,
            // and they need to be fixed on your or our side
            return "The screenshot rendering failed. Please, reach out to support.";
        default:
            // return a generic error message
            // or the message provided by the API error.error_message
            return "The screenshot rendering failed. Please, reach out to support.";
    }
}
