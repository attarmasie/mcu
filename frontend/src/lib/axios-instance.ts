import { ENV } from "@/constants/env";
import {
  propagation,
  ROOT_CONTEXT,
  SpanStatusCode,
  trace,
  type Span,
} from "@opentelemetry/api";
import Axios, {
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

type RequestConfigWithTrace = InternalAxiosRequestConfig & {
  metadata?: {
    span?: Span;
  };
};

export const AXIOS_INSTANCE = Axios.create({
  baseURL: `${ENV.BASE_URL}/v1`,
});

AXIOS_INSTANCE.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("authToken");
    const traceConfig = config as RequestConfigWithTrace;

    const method = (traceConfig.method || "GET").toUpperCase();
    const requestPath = traceConfig.url || "";
    const requestId = crypto.randomUUID();
    const tracer = trace.getTracer("mcu/frontend/http");
    const span = tracer.startSpan(`${method} ${requestPath}`);

    traceConfig.metadata = traceConfig.metadata || {};
    traceConfig.metadata.span = span;

    span.setAttribute("http.method", method);
    span.setAttribute("http.url", requestPath);
    span.setAttribute("http.request_id", requestId);

    const ctx = trace.setSpan(ROOT_CONTEXT, span);
    const carrier: Record<string, string> = {};
    propagation.inject(ctx, carrier);

    traceConfig.headers = traceConfig.headers || new AxiosHeaders();
    for (const [key, value] of Object.entries(carrier)) {
      traceConfig.headers.set(key, value);
    }
    traceConfig.headers.set("X-Request-ID", requestId);

    if (token) {
      traceConfig.headers.Authorization = `Bearer ${token}`;
    }

    return traceConfig;
  },
  (error) => {
    return Promise.reject(error);
  },
);

AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    const traceConfig = response.config as RequestConfigWithTrace;
    const span = traceConfig.metadata?.span;
    if (span) {
      span.setAttribute("http.status_code", response.status);
      span.setAttribute(
        "http.response_content_length",
        Number(response.headers["content-length"] || 0),
      );
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    }
    return response;
  },
  (error) => {
    const traceConfig = error.config as RequestConfigWithTrace | undefined;
    const span = traceConfig?.metadata?.span;
    if (span) {
      span.setStatus({ code: SpanStatusCode.ERROR });
      if (error.response?.status) {
        span.setAttribute("http.status_code", error.response.status);
      }
      if (error.code) {
        span.setAttribute("error.code", error.code);
      }
      if (error.message) {
        span.recordException(new Error(error.message));
      }
      span.end();
    }

    if (error.response?.status === 401) {
      sessionStorage.removeItem("authToken");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error axios cancel helper is attached dynamically for react-query generated client.
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
