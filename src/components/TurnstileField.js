'use client';

import { Turnstile } from '@marsidev/react-turnstile';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function TurnstileField({ onTokenChange, widgetKey = 0 }) {
  if (!SITE_KEY) {
    return (
      <div
        className="rounded-lg border border-amber-300/60 bg-amber-50/80 dark:bg-amber-950/30 dark:border-amber-700/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
        role="status"
      >
        Security check is not configured. Add Turnstile keys to enable form protection.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Turnstile
        key={widgetKey}
        siteKey={SITE_KEY}
        options={{
          action: 'contact_submit',
          theme: 'auto',
          appearance: 'interaction-only',
          retry: 'auto',
          refreshExpired: 'auto',
          size: 'flexible',
        }}
        onSuccess={(token) => onTokenChange(token)}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Protected by Cloudflare Turnstile. Most visitors pass automatically.
      </p>
    </div>
  );
}
