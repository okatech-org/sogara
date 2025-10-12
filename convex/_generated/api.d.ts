/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as employees from "../employees.js";
import type * as equipment from "../equipment.js";
import type * as hseIncidents from "../hseIncidents.js";
import type * as hseTrainings from "../hseTrainings.js";
import type * as packages from "../packages.js";
import type * as posts from "../posts.js";
import type * as seed from "../seed.js";
import type * as storage from "../storage.js";
import type * as visitors from "../visitors.js";
import type * as visits from "../visits.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  employees: typeof employees;
  equipment: typeof equipment;
  hseIncidents: typeof hseIncidents;
  hseTrainings: typeof hseTrainings;
  packages: typeof packages;
  posts: typeof posts;
  seed: typeof seed;
  storage: typeof storage;
  visitors: typeof visitors;
  visits: typeof visits;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
