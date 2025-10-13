import { ConvexReactClient } from 'convex/react'

const resolvedConvexUrl =
  (import.meta.env.VITE_CONVEX_URL as string | undefined) || 'http://127.0.0.1:3210'

const client = new ConvexReactClient(resolvedConvexUrl)

export const convexClientAvailable = true

export const convex = {
  query: async (name: string, args: any) => {
    // @ts-expect-error Allow generic query by name without generated types
    return client.query(name, args)
  },
  mutation: async (name: string, args: any) => {
    // @ts-expect-error Allow generic mutation by name without generated types
    return client.mutation(name, args)
  },
  get raw() {
    return client
  },
}
