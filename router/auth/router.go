package auth

import (
	"github.com/SlaterRGordon/fut/handler/auth"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {

	// Auth routes
	api := app.Group("/auth")

	api.Post("/login", auth.Login)
}
