import { ENV } from "@/constants/env";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { trace } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";

let telemetryInitialized = false;

export function initTelemetry(): void {
  if (!ENV.OTEL_ENABLED || telemetryInitialized) {
    return;
  }
  telemetryInitialized = true;

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      "service.name": ENV.OTEL_SERVICE_NAME,
      "service.version": ENV.APP_VERSION,
      "deployment.environment": ENV.ENVIRONMENT,
    }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: ENV.OTEL_EXPORTER_OTLP_ENDPOINT,
        }),
      ),
    ],
  });

  provider.register();
}

export function initFrontendErrorMonitoring(): void {
  if (!ENV.OTEL_ENABLED) {
    return;
  }

  const tracer = trace.getTracer("mcu/frontend/errors");

  window.addEventListener("error", (event) => {
    const span = tracer.startSpan("frontend.error");
    span.recordException(event.error ?? new Error(event.message));
    span.setAttribute("error.message", event.message);
    span.setAttribute("error.filename", event.filename);
    span.setAttribute("error.line", event.lineno);
    span.setAttribute("error.column", event.colno);
    span.end();
  });

  window.addEventListener("unhandledrejection", (event) => {
    const span = tracer.startSpan("frontend.unhandled_rejection");
    const reason = event.reason;
    if (reason instanceof Error) {
      span.recordException(reason);
      span.setAttribute("error.message", reason.message);
      span.setAttribute("error.name", reason.name);
    } else {
      span.setAttribute("error.message", String(reason));
    }
    span.end();
  });
}
