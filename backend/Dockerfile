# Stage 1: Builder
# Use an official Go runtime as a parent image
FROM golang:1.25-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the go.mod and go.sum files to the working directory
COPY go.mod go.sum ./

# Download all the dependencies
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the application
# The CGO_ENABLED=0 flag creates a statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -o app ./cmd/main.go

# Build the seeder binary
RUN CGO_ENABLED=0 GOOS=linux go build -o seeder ./cmd/tools/seed/main.go

# Stage 2: Final Image
# Start a new stage from scratch (a very small base image) or distroless
FROM scratch

# Set the working directory to the root
WORKDIR /

# Provide minimal process identity for OpenTelemetry resource detectors on scratch image.
ENV USER=app
ENV HOME=/

# Copy the built binaries from the 'builder' stage
COPY --from=builder /app/app .
COPY --from=builder /app/seeder .

# Expose the port the app runs on (Gin defaults to 8080)
EXPOSE 8080

# Command to run the executable when the container starts
ENTRYPOINT ["./app"]
