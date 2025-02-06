import { NextResponse, URLPattern as NextURLPattern } from "next/server";
import type { NextRequest } from "next/server";
import { getAppSettings } from "@/app/api/server/utils";
import { notFound } from "next/navigation";
import { isNotFoundError } from "next/dist/client/components/not-found";

// Constants
const PATHNAMES = [
  "/demo/:organizationId/:agentId/:path*",
  "/:organizationId/:agentId/:path*",
] as const;

// Types
interface PathParams {
  organizationId?: string;
  agentId?: string;
  [key: string]: string | undefined;
}

/**
 * Extracts path parameters from a URL based on predefined patterns
 */
const extractPathParams = (url: string): PathParams => {
  const input = url.split("?")[0];

  for (const pathname of PATHNAMES) {
    const pattern = new NextURLPattern({ pathname });
    const patternResult = pattern.exec(input);
    if (patternResult?.pathname?.groups) {
      return patternResult.pathname.groups;
    }
  }
  return {};
};

/**
 * Validates if a referrer domain is in the allowlist
 */
const isAllowedDomain = (
  referrer: string | null,
  allowlist: string[],
): boolean => {
  if (!referrer) return false;
  return allowlist.some((domain) => referrer.includes(domain));
};

/**
 * Checks if the request supports Content Security Policy
 */
const supportsCsp = (request: NextRequest): boolean => {
  return request.headers.get("sec-fetch-mode") === "navigate";
};

/**
 * Processes security settings and returns appropriate headers
 */
const processSecuritySettings = (
  appSettings: ParsedAppSettings,
  request: NextRequest,
): { headers?: string; blocked: boolean } => {
  const allowlist = [...(appSettings.security.embedAllowList || [])];
  const enableDemoSite = ["true", "1"].includes(
    appSettings.branding.enableDemoSite || "",
  );
  const referrer = request.headers.get("referer");

  if (enableDemoSite) {
    allowlist.push("'self'");
  }

  if (allowlist.length === 0) {
    allowlist.push("'none'");
  }

  return {
    headers: `frame-ancestors ${allowlist.join(" ")}`,
    blocked: !supportsCsp(request) && !isAllowedDomain(referrer, allowlist),
  };
};

/**
 * Middleware function to handle request processing
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  if (
    !["iframe", "document"].includes(
      request.headers.get("sec-fetch-dest") || "",
    )
  ) {
    return response;
  }

  const { organizationId, agentId } = extractPathParams(request.url);

  if (organizationId && agentId) {
    // Add 15-minute cache header
    response.headers.set(
      "Cache-Control",
      "public, max-age=900, stale-while-revalidate=60",
    );

    try {
      const appSettings = await getAppSettings(organizationId, agentId);
      const security = processSecuritySettings(appSettings, request);
      const ENABLE_CSP_LOGGING = process.env.ENABLE_CSP_LOGGING === "true";
      const ORGANIZATIONS_WITH_CSP_DISABLED =
        process.env.ORGANIZATIONS_WITH_CSP_DISABLED?.split(",") || [];
      const shouldApplyCsp =
        !ORGANIZATIONS_WITH_CSP_DISABLED.includes(organizationId);

      if (security.headers) {
        if (shouldApplyCsp) {
          response.headers.set("Content-Security-Policy", security.headers);
        } else {
          if (ENABLE_CSP_LOGGING) {
            console.log("CSP disabled for organization", organizationId);
          }
        }

        if (ENABLE_CSP_LOGGING) {
          console.log({
            url: request.url,
            cspHeaders: security.headers,
            blocked: security.blocked,
            supportsCsp: supportsCsp(request),
            referrer: request.headers.get("referer"),
            origin: request.headers.get("origin"),
            secFetchDest: request.headers.get("sec-fetch-dest"),
            secFetchMode: request.headers.get("sec-fetch-mode"),
            isAllowedDomain: isAllowedDomain(
              request.headers.get("referer"),
              appSettings.security.embedAllowList || [],
            ),
          });
        }

        if (security.blocked) {
          notFound();
        }
      }
    } catch (error) {
      if (isNotFoundError(error)) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }
    }
  }

  return response;
}

// Configuration for Next.js middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - /api (API routes)
     * - /_next (Next.js internal routes)
     */
    "/((?!api|_next/|_next$|not-found).*)",
  ],
};
