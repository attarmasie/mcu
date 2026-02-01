# Stage 1: Builder
# Use an official Go runtime as a parent image
FROM golang:1.23-alpine AS builder

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
RUN CGO_ENABLED=0 GOOS=linux go build -o app .

# Stage 2: Final Image
# Start a new stage from scratch (a very small base image) or distroless
FROM scratch

# Set the working directory to the root
WORKDIR /

# Copy the built binary from the 'builder' stage
COPY --from=builder /app/app .

# Expose the port the app runs on (Gin defaults to 8080)
EXPOSE 8080

# Command to run the executable when the container starts
ENTRYPOINT ["./app"]
