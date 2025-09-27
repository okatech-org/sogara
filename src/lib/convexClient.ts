import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

let client: ConvexReactClient | null = null;
if (convexUrl && typeof convexUrl === "string" && convexUrl.length > 0) {
  client = new ConvexReactClient(convexUrl);
}

export const convexClientAvailable = !!client;

export const convex = {
  query: async (name: string, args: any) => {
    if (!client) return null;
    // @ts-expect-error Allow generic query by name without generated types
    return client.query(name, args);
  },
  mutation: async (name: string, args: any) => {
    if (!client) return null;
    // @ts-expect-error Allow generic mutation by name without generated types
    return client.mutation(name, args);
  },
  get raw() {
    return client;
  },
};


