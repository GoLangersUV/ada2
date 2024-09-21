/*
 * File: main.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/01/2024
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
  "log"
  "net/http"

  "github.com/rs/cors"

  "github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/handlers"
)

func main() {
    // Rutas de los algoritmos
    http.HandleFunc("/modex/pd", handlers.ModexPDHandler)
    http.HandleFunc("/modex/fb", handlers.ModexFBHandler)
    http.HandleFunc("/modex/v", handlers.ModexVHandler)

    // Rutas para manejo de archivos
    http.HandleFunc("/upload", handlers.UploadHandler)
    http.HandleFunc("/files", handlers.FilesHandler)
    http.HandleFunc("/network", handlers.GetNetworkHandler)

    // Configurar CORS
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:5173"}, // Cambiado a 5173
        AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
        AllowedHeaders:   []string{"Content-Type"},
        AllowCredentials: true,
    })

    handler := c.Handler(http.DefaultServeMux)

    log.Println("Server running on http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
