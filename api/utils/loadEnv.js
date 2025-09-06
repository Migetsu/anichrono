import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  loaded = true;

  if (process.env.SHIKI_CLIENT_ID) return;

  const cwd = process.cwd();
  for (const filename of ['.env', '.env.example']) {
    const envPath = resolve(cwd, filename);
    if (!existsSync(envPath)) continue;

    try {
      const content = readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (!process.env[key]) process.env[key] = value;
        }
      }
      break;
    } catch {
      // ignore read errors
    }
  }
}

