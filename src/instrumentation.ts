import { runMigrations } from "./server/db";

export async function register() {
  await runMigrations();
}
