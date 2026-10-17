// Ambient declarations for Deno runtime and Supabase Edge Function URL imports
// This allows IDE / TypeScript servers without the Deno extension to resolve types cleanly.

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  }
  export const env: Env;
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number }
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient<T = any>(
    supabaseUrl: string,
    supabaseKey: string,
    options?: any
  ): any;
  export type SupabaseClient = any;
  export type User = any;
  export type Session = any;
}

declare module "https://deno.land/x/zod@v3.22.4/mod.ts" {
  export namespace z {
    export interface ZodType<T = any> {
      parse(data: unknown): T;
      safeParse(data: unknown): { success: true; data: T } | { success: false; error: any };
      min(length: number, message?: string): ZodType<T>;
      max(length: number, message?: string): ZodType<T>;
    }
    export function object(shape: Record<string, any>): ZodType<any>;
    export function string(params?: any): ZodType<string>;
    export function array(element: any): ZodType<any[]>;
    export function number(params?: any): ZodType<number>;
    export function boolean(params?: any): ZodType<boolean>;
  }
}
