package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.opentelemetry.io/otel/trace"
)

const maxLoggedBodyBytes = 4096

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func AccessLog() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		var requestBody []byte
		if c.Request.Body != nil {
			requestBody, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
		}

		responseBodyWriter := &bodyLogWriter{
			ResponseWriter: c.Writer,
			body:           bytes.NewBufferString(""),
		}
		c.Writer = responseBodyWriter

		c.Next()

		path := c.Request.URL.Path
		if path == "/metrics" || path == "/health" {
			return
		}

		entry := map[string]any{
			"ts":         time.Now().Format(time.RFC3339Nano),
			"level":      "info",
			"msg":        "http_request",
			"request_id": c.GetString("RequestID"),
			"method":     c.Request.Method,
			"path":       path,
			"route":      c.FullPath(),
			"query":      c.Request.URL.RawQuery,
			"status":     c.Writer.Status(),
			"latency_ms": float64(time.Since(start).Microseconds()) / 1000.0,
			"client_ip":  c.ClientIP(),
			"user_agent": c.Request.UserAgent(),
			"bytes_out":  c.Writer.Size(),
			"request": map[string]any{
				"body": sanitizeBodyPreview(requestBody),
			},
			"response": map[string]any{
				"body": sanitizeBodyPreview(responseBodyWriter.body.Bytes()),
			},
		}

		if len(c.Errors) > 0 {
			entry["error"] = c.Errors.String()
		}

		spanCtx := trace.SpanContextFromContext(c.Request.Context())
		if spanCtx.IsValid() {
			entry["trace_id"] = spanCtx.TraceID().String()
			entry["span_id"] = spanCtx.SpanID().String()
		}

		payload, err := json.Marshal(entry)
		if err != nil {
			log.Printf(`{"ts":"%s","level":"error","msg":"access_log_marshal_failed","error":"%s"}`,
				time.Now().Format(time.RFC3339Nano), err.Error())
			return
		}
		log.Println(string(payload))
	}
}

func sanitizeBodyPreview(raw []byte) any {
	if len(raw) == 0 {
		return ""
	}

	trimmed := bytes.TrimSpace(raw)
	if len(trimmed) == 0 {
		return ""
	}

	// Redact common sensitive keys for JSON payloads.
	var parsed any
	if err := json.Unmarshal(trimmed, &parsed); err == nil {
		redactSensitive(parsed)
		b, err := json.Marshal(parsed)
		if err == nil {
			return limitString(string(b), maxLoggedBodyBytes)
		}
	}

	return limitString(string(trimmed), maxLoggedBodyBytes)
}

func redactSensitive(value any) {
	switch v := value.(type) {
	case map[string]any:
		keys := make([]string, 0, len(v))
		for k := range v {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, key := range keys {
			lowerKey := strings.ToLower(key)
			if isSensitiveKey(lowerKey) {
				v[key] = "***redacted***"
				continue
			}
			redactSensitive(v[key])
		}
	case []any:
		for _, item := range v {
			redactSensitive(item)
		}
	}
}

func isSensitiveKey(lowerKey string) bool {
	switch lowerKey {
	case "password", "new_password", "old_password", "token", "access_token", "refresh_token", "authorization", "secret":
		return true
	default:
		return false
	}
}

func limitString(input string, limit int) string {
	if len(input) <= limit {
		return input
	}
	return input[:limit] + "...(truncated)"
}
