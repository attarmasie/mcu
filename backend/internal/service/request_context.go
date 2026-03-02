package service

import "context"

type contextKey string

const actorUserIDContextKey contextKey = "actor_user_id"

func WithActorUserID(ctx context.Context, userID string) context.Context {
	if userID == "" {
		return ctx
	}
	return context.WithValue(ctx, actorUserIDContextKey, userID)
}

func GetActorUserID(ctx context.Context) *string {
	value := ctx.Value(actorUserIDContextKey)
	if value == nil {
		return nil
	}

	userID, ok := value.(string)
	if !ok || userID == "" {
		return nil
	}
	return &userID
}
