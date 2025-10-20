import { registerOTel } from '@vercel/otel'

// This file is the safe entrypoint for both node and edge runtimes.
// It will register @vercel/otel which supports edge and node. If you
// need custom Node-only SDK configuration, create `instrumentation.node.ts`
// and import it conditionally from this file.
export function register() {
  // Default serviceName; override with NEXT_OTEL_SERVICE_NAME
  registerOTel({ serviceName: "badgerfang-antiraid" })
}

// Automatically register when imported (Next docs expect register function to be available)
try {
  // Only run in a Node-like environment; guard against browser/edge globals
  if (typeof window === 'undefined') {
    register()
  }
} catch (e) {
  // swallow any errors during registration to avoid breaking the app
  // eslint-disable-next-line no-console
  console.warn('OpenTelemetry registration failed', e)
}
