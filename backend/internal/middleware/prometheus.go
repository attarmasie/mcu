package middleware

import (
	"errors"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	metricsOnce sync.Once

	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of handled HTTP requests.",
		},
		[]string{"method", "route", "status"},
	)
	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "route", "status"},
	)
	appBuildInfo = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "app_build_info",
			Help: "Application build and environment info.",
		},
		[]string{"service", "version", "environment"},
	)
)

func initPrometheusMetrics() {
	metricsOnce.Do(func() {
		registerCollector(httpRequestsTotal)
		registerCollector(httpRequestDuration)
		registerCollector(appBuildInfo)
		appBuildInfo.WithLabelValues(
			getEnv("OTEL_SERVICE_NAME", "mcu-backend"),
			getEnv("APP_VERSION", "dev"),
			getEnv("APP_ENV", "development"),
		).Set(1)
	})
}

func registerCollector(collector prometheus.Collector) {
	err := prometheus.DefaultRegisterer.Register(collector)
	if err == nil {
		return
	}

	var alreadyRegistered prometheus.AlreadyRegisteredError
	if errors.As(err, &alreadyRegistered) {
		return
	}
}

func PrometheusHTTPMetrics() gin.HandlerFunc {
	initPrometheusMetrics()

	return func(c *gin.Context) {
		if c.Request.URL.Path == "/metrics" {
			c.Next()
			return
		}

		start := time.Now()
		c.Next()

		route := c.FullPath()
		if route == "" {
			route = "UNMATCHED"
		}

		status := strconv.Itoa(c.Writer.Status())
		method := c.Request.Method

		httpRequestsTotal.WithLabelValues(method, route, status).Inc()
		httpRequestDuration.WithLabelValues(method, route, status).Observe(time.Since(start).Seconds())
	}
}

func PrometheusHandler() gin.HandlerFunc {
	initPrometheusMetrics()
	return gin.WrapH(promhttp.Handler())
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
