package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache interface - all cache implementations must satisfy this
type Cache interface {
	Get(ctx context.Context, key string, dest interface{}) error
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Delete(ctx context.Context, key string) error
	DeletePattern(ctx context.Context, pattern string) error
	Close() error
}

// RedisCache implements Cache using Redis
type RedisCache struct {
	client *redis.Client
}

// NoOpCache implements Cache but does nothing (for disabled cache)
type NoOpCache struct{}

func NewRedisCache(addr, password string, db int) (*RedisCache, error) {
	client := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     10,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &RedisCache{client: client}, nil
}

// NewNoOpCache returns a cache that does nothing
func NewNoOpCache() *NoOpCache {
	return &NoOpCache{}
}

func (r *RedisCache) Get(ctx context.Context, key string, dest interface{}) error {
	val, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return fmt.Errorf("key not found")
	}
	if err != nil {
		return err
	}

	return json.Unmarshal([]byte(val), dest)
}

func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	json, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return r.client.Set(ctx, key, json, expiration).Err()
}

func (r *RedisCache) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

func (r *RedisCache) DeletePattern(ctx context.Context, pattern string) error {
	iter := r.client.Scan(ctx, 0, pattern, 0).Iterator()
	for iter.Next(ctx) {
		if err := r.client.Del(ctx, iter.Val()).Err(); err != nil {
			return err
		}
	}
	return iter.Err()
}

func (r *RedisCache) Close() error {
	return r.client.Close()
}

// NoOpCache methods - do nothing but satisfy the interface
func (n *NoOpCache) Get(ctx context.Context, key string, dest interface{}) error {
	return fmt.Errorf("cache disabled")
}

func (n *NoOpCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return nil
}

func (n *NoOpCache) Delete(ctx context.Context, key string) error {
	return nil
}

func (n *NoOpCache) DeletePattern(ctx context.Context, pattern string) error {
	return nil
}

func (n *NoOpCache) Close() error {
	return nil
}
