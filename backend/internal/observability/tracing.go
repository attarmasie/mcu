package observability

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

func InitTracing(ctx context.Context, serviceName string) (func(context.Context) error, error) {
	if os.Getenv("OTEL_SDK_DISABLED") == "true" {
		otel.SetTextMapPropagator(
			propagation.NewCompositeTextMapPropagator(
				propagation.TraceContext{},
				propagation.Baggage{},
			),
		)
		logJSON("tracing_configured", map[string]any{
			"tracing_enabled": false,
		})
		return func(context.Context) error { return nil }, nil
	}

	res, err := resource.New(
		ctx,
		resource.WithAttributes(attribute.String("service.name", serviceName)),
		resource.WithFromEnv(),
		resource.WithProcess(),
		resource.WithHost(),
		resource.WithTelemetrySDK(),
	)
	if err != nil {
		logJSON("tracing_init_failed", map[string]any{
			"error": fmt.Sprintf("failed to create otel resource: %v", err),
		})
		otel.SetTextMapPropagator(
			propagation.NewCompositeTextMapPropagator(
				propagation.TraceContext{},
				propagation.Baggage{},
			),
		)
		return func(context.Context) error { return nil }, nil
	}

	exp, protocol, err := newTraceExporter(ctx)
	if err != nil {
		logJSON("tracing_init_failed", map[string]any{
			"error": err.Error(),
		})
		otel.SetTextMapPropagator(
			propagation.NewCompositeTextMapPropagator(
				propagation.TraceContext{},
				propagation.Baggage{},
			),
		)
		return func(context.Context) error { return nil }, nil
	}

	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(res),
		sdktrace.WithSampler(getSampler()),
	)

	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(
		propagation.NewCompositeTextMapPropagator(
			propagation.TraceContext{},
			propagation.Baggage{},
		),
	)

	logJSON("tracing_configured", map[string]any{
		"tracing_enabled": true,
		"otlp_protocol":   protocol,
		"otlp_endpoint":   traceEndpoint(),
		"sampler":         getEnv("OTEL_TRACES_SAMPLER", "parentbased_traceidratio"),
		"sampler_arg":     getEnv("OTEL_TRACES_SAMPLER_ARG", "1.0"),
	})

	return tp.Shutdown, nil
}

func newTraceExporter(ctx context.Context) (*otlptrace.Exporter, string, error) {
	protocol := getEnv("OTEL_EXPORTER_OTLP_PROTOCOL", "grpc")

	switch protocol {
	case "grpc":
		exp, err := otlptracegrpc.New(
			ctx,
			otlptracegrpc.WithInsecure(),
		)
		return exp, protocol, err
	case "http/protobuf":
		exp, err := otlptracehttp.New(
			ctx,
			otlptracehttp.WithInsecure(),
		)
		return exp, protocol, err
	default:
		return nil, "", fmt.Errorf("unsupported OTLP protocol: %s", protocol)
	}
}

func getSampler() sdktrace.Sampler {
	sampler := getEnv("OTEL_TRACES_SAMPLER", "parentbased_traceidratio")
	arg := getEnv("OTEL_TRACES_SAMPLER_ARG", "1.0")

	switch sampler {
	case "always_on":
		return sdktrace.AlwaysSample()
	case "always_off":
		return sdktrace.NeverSample()
	case "traceidratio":
		return sdktrace.TraceIDRatioBased(parseFloat(arg, 1.0))
	case "parentbased_always_on":
		return sdktrace.ParentBased(sdktrace.AlwaysSample())
	case "parentbased_always_off":
		return sdktrace.ParentBased(sdktrace.NeverSample())
	case "parentbased_traceidratio":
		return sdktrace.ParentBased(
			sdktrace.TraceIDRatioBased(parseFloat(arg, 1.0)),
		)
	default:
		return sdktrace.ParentBased(sdktrace.TraceIDRatioBased(1.0))
	}
}

func traceEndpoint() string {
	if v := os.Getenv("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"); v != "" {
		return v
	}
	return os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
}

func parseFloat(raw string, fallback float64) float64 {
	v, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		return fallback
	}
	return v
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func logJSON(msg string, attrs map[string]any) {
	entry := map[string]any{
		"ts":    time.Now().Format(time.RFC3339Nano),
		"level": "info",
		"msg":   msg,
	}
	for key, value := range attrs {
		entry[key] = value
	}
	payload, err := json.Marshal(entry)
	if err != nil {
		log.Printf(`{"ts":"%s","level":"error","msg":"telemetry_log_marshal_failed","error":"%s"}`,
			time.Now().Format(time.RFC3339Nano), err.Error())
		return
	}
	log.Println(string(payload))
}
