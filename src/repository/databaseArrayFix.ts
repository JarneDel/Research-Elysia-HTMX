/**
 * https://github.com/supabase/postgrest-js/issues/471
 * @param objectOrNull
 */

export function fixOneToOne<T>(objectOrNull: T[]): T {
  return objectOrNull as T
}
