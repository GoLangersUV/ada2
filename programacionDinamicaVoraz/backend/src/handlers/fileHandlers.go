/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/handlers/fileHandlers.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */

// Package handlers provides HTTP handlers for file upload and download operations.
package handlers

import (
	"bufio"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex"
)

var (
	networks   = make(map[string]modex.Network)
	networksMu sync.RWMutex
)

// UploadHandler handles the file upload operation. It reads the file from the
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error al obtener el archivo", http.StatusBadRequest)
		return
	}
	defer file.Close()

	os.MkdirAll("uploads", os.ModePerm)

	filePath := filepath.Join("uploads", handler.Filename)
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Error al crear el archivo en el servidor", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Error al guardar el archivo", http.StatusInternalServerError)
		return
	}

	network, err := parseNetworkFromFile(filePath)
	if err != nil {
		http.Error(w, "Error al parsear el archivo: "+err.Error(), http.StatusBadRequest)
		return
	}

	networksMu.Lock()
	networks[handler.Filename] = network
	networksMu.Unlock()

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Archivo subido y procesado exitosamente"))
}

// FilesHandler handles the file listing operation. It returns a JSON array with
func FilesHandler(w http.ResponseWriter, r *http.Request) {
	if _, err := os.Stat("uploads/"); os.IsNotExist(err) {
		os.MkdirAll("uploads", os.ModePerm)
	}

	files, err := os.ReadDir("uploads/")
	if err != nil {
		log.Println("Error al leer los archivos:", err)
		files = []os.DirEntry{}
	}

	var fileNames []string
	for _, file := range files {
		if !file.IsDir() && strings.HasSuffix(file.Name(), ".txt") {
			fileNames = append(fileNames, file.Name())
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(fileNames)
}

// GetNetworkHandler handles the network retrieval operation. It returns the network
func GetNetworkHandler(w http.ResponseWriter, r *http.Request) {
	fileName := r.URL.Query().Get("file")
	if fileName == "" {
		http.Error(w, "Falta el parámetro 'file'", http.StatusBadRequest)
		return
	}

	networksMu.RLock()
	network, exists := networks[fileName]
	networksMu.RUnlock()
	if !exists {
		http.Error(w, "El archivo no existe o no ha sido procesado", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(network)
}

// parseNetworkFromFile reads a file and creates a Network struct from its contents.
func parseNetworkFromFile(filePath string) (modex.Network, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return modex.Network{}, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	if !scanner.Scan() {
		return modex.Network{}, errors.New("El archivo está vacío o tiene un formato incorrecto")
	}
	nAgentsStr := strings.TrimSpace(scanner.Text())
	nAgents, err := strconv.Atoi(nAgentsStr)
	if err != nil {
		return modex.Network{}, errors.New("Error al leer el número de agentes: " + err.Error())
	}

	var agents []modex.Agent
	for i := 0; i < nAgents; i++ {
		if !scanner.Scan() {
			return modex.Network{}, errors.New("Número insuficiente de agentes en el archivo")
		}
		line := strings.TrimSpace(scanner.Text())
		parts := strings.Split(line, ",")
		if len(parts) != 2 {
			return modex.Network{}, errors.New("Formato incorrecto en la línea: " + line)
		}

		opinion, err := strconv.ParseInt(parts[0], 10, 8)
		if err != nil {
			return modex.Network{}, errors.New("Error al leer la opinión: " + err.Error())
		}
		receptivity, err := strconv.ParseFloat(parts[1], 64)
		if err != nil {
			return modex.Network{}, errors.New("Error al leer la receptividad: " + err.Error())
		}

		agent := modex.Agent{
			Opinion:     int8(opinion),
			Receptivity: receptivity,
		}
		agents = append(agents, agent)
	}

	if !scanner.Scan() {
		return modex.Network{}, errors.New("Falta el valor de los recursos en el archivo")
	}
	resourcesStr := strings.TrimSpace(scanner.Text())
	resources, err := strconv.ParseUint(resourcesStr, 10, 64)
	if err != nil {
		return modex.Network{}, errors.New("Error al leer los recursos: " + err.Error())
	}

	network := modex.Network{
		Agents:    agents,
		Resources: resources,
	}

	network.Extremism = modex.Extremism(&network)
	strategyAllOnes := make([]byte, len(network.Agents))
	for i := range strategyAllOnes {
		strategyAllOnes[i] = 1
	}
	network.Effort, _ = modex.Effort(&network, strategyAllOnes)

	return network, nil
}
