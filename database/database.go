package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoInstance struct {
	Client   *mongo.Client
	Database *mongo.Database
}

var Instance MongoInstance

func Connect() error {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	uri := os.Getenv("DATABASE_CONNECTION")
	name := os.Getenv("DATABASE_NAME")

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	client, connectionError := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if connectionError != nil {
		return connectionError
	}

	db := client.Database(name)
	Instance = MongoInstance{
		Client:   client,
		Database: db,
	}

	return nil
}
