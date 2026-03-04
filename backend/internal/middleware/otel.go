package middleware

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/trace"
)

func OTelHTTP() gin.HandlerFunc {
	tracer := otel.Tracer("mcu/backend/http")
	propagator := otel.GetTextMapPropagator()

	return func(c *gin.Context) {
		ctx := propagator.Extract(c.Request.Context(), propagation.HeaderCarrier(c.Request.Header))

		route := c.FullPath()
		if route == "" {
			route = c.Request.URL.Path
		}

		spanName := fmt.Sprintf("%s %s", c.Request.Method, route)
		ctx, span := tracer.Start(
			ctx,
			spanName,
			trace.WithSpanKind(trace.SpanKindServer),
			trace.WithAttributes(
				attribute.String("http.method", c.Request.Method),
				attribute.String("http.target", c.Request.URL.Path),
				attribute.String("http.route", route),
				attribute.String("http.scheme", c.Request.URL.Scheme),
				attribute.String("net.host.name", c.Request.Host),
				attribute.String("http.user_agent", c.Request.UserAgent()),
			),
		)
		defer span.End()

		c.Request = c.Request.WithContext(ctx)
		propagator.Inject(ctx, propagation.HeaderCarrier(c.Writer.Header()))

		c.Next()

		statusCode := c.Writer.Status()
		span.SetAttributes(attribute.Int("http.status_code", statusCode))

		if len(c.Errors) > 0 {
			span.RecordError(errors.New(c.Errors.String()))
		}

		if statusCode >= http.StatusInternalServerError {
			span.SetStatus(codes.Error, http.StatusText(statusCode))
			return
		}
		span.SetStatus(codes.Ok, "")
	}
}
