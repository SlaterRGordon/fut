package main

import (
	"os"

	"github.com/SlaterRGordon/fut/database"
	"github.com/SlaterRGordon/fut/router/auth"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// connect to the database
	database.Connect()

	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())
	app.Use(recover.New())

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	// Setup Routes
	auth.SetupRoutes(app)

	var port string
	if port = os.Getenv("PORT"); port == "" {
		port = "8080"
	}
	app.Listen(":" + port)
}
