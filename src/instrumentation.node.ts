import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

// This module initializes the Node OpenTelemetry SDK. It should only be
// imported when running in the node runtime (process.env.NEXT_RUNTIME === 'nodejs').

const serviceName = 'badgerfang-antiraid'

const sdk = new NodeSDK({
   // @ts-ignore
  resource: new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  spanProcessor: new SimpleSpanProcessor(new OTLPTraceExporter()),
})

sdk.start()

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0))
})