'use client';

import { useEffect, useRef, useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const LOAD_TIMEOUT_MS = 8000;

export default function TurnstileField({ widgetKey = 0, onTokenChange }) {
  const timerRef = useRef(null);
  const [unresponsive, setUnresponsive] = useState(false);

  // With 'interaction-only' the widget is invisible when it passes silently, so the
  // failure mode is indistinguishable from success. Say something if no token arrives.
  useEffect(() => {
    if (!SITE_KEY) return undefined;
    setUnresponsive(false);
    timerRef.current = setTimeout(() => setUnresponsive(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timerRef.current);
  }, [widgetKey]);

  function handleToken(token) {
    if (token) {
      clearTimeout(timerRef.current);
      setUnresponsive(false);
    }
    onTokenChange(token);
  }

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
        onSuccess={handleToken}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
      />
      {unresponsive && (
        <p className="text-xs text-amber-700 dark:text-amber-400" role="status">
          The security check has not loaded yet. An ad-blocker or privacy extension may be
          blocking Cloudflare Turnstile &mdash; disable it for this site and reload.
        </p>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Protected by Cloudflare Turnstile. Most visitors pass automatically.
      </p>
    </div>
  );
}
