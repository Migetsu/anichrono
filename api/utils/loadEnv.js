import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  loaded = true;

  if (process.env.SHIKI_CLIENT_ID) return;

  try {
    const envPath = resolve(process.cwd(), '.env');
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) process.env[key] = value;
      }
    }
  } catch {
    // ignore if .env not found
  }
}

