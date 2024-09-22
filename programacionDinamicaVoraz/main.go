/*
* File: main.go
* Authors: Julián Ernesto Puyo Mora...2226905
*          Cristian David Pacheco.....2227437
*          Juan Sebastián Molina......2224491
*          Juan Camilo Narváez Tascón.2140112
* Creation date: 09/01/2024
* Last modification: 09/22/2024
* License: GNU-GPL
 */

// Package main implements the ModEx program, which addresses the problem of Opinion
// extremism in a simulated social network. In this network, each agent holds an
// Opinion on a specific topic, quantified on a scale from -100 to 100. Values closer
// to 0 represent more moderate opinions, while extreme values (-100 or 100) represent
// higher levels of extremism. Additionally, each agent has a Receptivity level ranging
// from 0 to 1, which determines how easily their Opinion can be moderated.
//
// The goal of the ModEx program is to reduce extremism in the network by moderating
// agents' opinions. This is achieved by investing an effort, calculated based on each
// agent's Receptivity and extremism level. Given a maximum amount of availableresources,
// the program must determine which agents to target to achieve the greatest possible
// reduction in extremism across the network.
package main

import (
	"context"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/handlers"
	"github.com/rs/cors"
)

//go:embed frontend/dist
var frontendFiles embed.FS

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := runBackend(ctx); err != nil {
			log.Printf("Backend server error: %v", err)
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		if err := runFrontend(ctx); err != nil {
			log.Printf("Frontend server error: %v", err)
		}
	}()

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, os.Interrupt, syscall.SIGTERM)
	<-sigCh

	cancel()

	wg.Wait()
	log.Println("Application shutdown complete")
}

func runBackend(ctx context.Context) error {
	uploadsDir := "uploads"

	if err := cleanUploadsDir(uploadsDir); err != nil {
		return fmt.Errorf("failed to clean uploads directory: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/modex/pd", handlers.ModexPDHandler)
	mux.HandleFunc("/modex/fb", handlers.ModexFBHandler)
	mux.HandleFunc("/modex/v", handlers.ModexVHandler)
	mux.HandleFunc("/upload", handlers.UploadHandler)
	mux.HandleFunc("/files", handlers.FilesHandler)
	mux.HandleFunc("/network", handlers.GetNetworkHandler)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	})

	handler := c.Handler(mux)

	server := &http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	go func() {
		<-ctx.Done()
		if err := server.Shutdown(context.Background()); err != nil {
			log.Printf("Backend server shutdown error: %v", err)
		}
	}()

	log.Println("Backend server running on http://localhost:8080")
	return server.ListenAndServe()
}

func runFrontend(ctx context.Context) error {
	frontendFS, err := fs.Sub(frontendFiles, "frontend/dist")
	if err != nil {
		return fmt.Errorf("failed to create sub-filesystem: %v", err)
	}

	handler := http.FileServer(http.FS(frontendFS))

	server := &http.Server{
		Addr:    ":3000",
		Handler: handler,
	}

	go func() {
		<-ctx.Done()
		if err := server.Shutdown(context.Background()); err != nil {
			log.Printf("Frontend server shutdown error: %v", err)
		}
	}()

	log.Println("Frontend server running on http://localhost:3000")
	return server.ListenAndServe()
}

func cleanUploadsDir(dir string) error {
	if err := os.RemoveAll(dir); err != nil {
		return err
	}

	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return err
	}

	log.Printf("Successfully cleaned and recreated the '%s' directory.", dir)
	return nil
}
