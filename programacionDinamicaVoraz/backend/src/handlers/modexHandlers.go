/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/handlers/modexHandlers.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */

// Package handlers provides HTTP handlers for modex operations.
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex"
)

// byteSliceToIntSlice converts a byte slice to an int slice.
func byteSliceToIntSlice(b []byte) []int {
	intSlice := make([]int, len(b))
	for i, v := range b {
		intSlice[i] = int(v)
	}
	return intSlice
}

// processModex processes the Modex operation.
func processModex(w http.ResponseWriter, network modex.Network, algorithm func(*modex.Network) ([]byte, float64, float64, float64, error)) {
	minStrategy, minEffort, minExtremism, computationTime, err := algorithm(&network)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	strategyInt := byteSliceToIntSlice(minStrategy)

	response := struct {
		Strategy        []int   `json:"strategy"`
		Effort          float64 `json:"effort"`
		Extremism       float64 `json:"extremism"`
		ComputationTime float64 `json:"computationTime"`
	}{
		Strategy:        strategyInt,
		Effort:          minEffort,
		Extremism:       minExtremism,
		ComputationTime: computationTime,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ModexFBHandler handles the ModexFB operation.
func ModexFBHandler(w http.ResponseWriter, r *http.Request) {
	processModexHandler(w, r, modex.ModexFB)
}

// ModexPDHandler handles the ModexPD operation.
func ModexPDHandler(w http.ResponseWriter, r *http.Request) {
	processModexHandler(w, r, modex.ModexPD)
}

// ModexVHandler handles the ModexV operation.
func ModexVHandler(w http.ResponseWriter, r *http.Request) {
	processModexHandler(w, r, modex.ModexV)
}

// processModexHandler obtiene el network y ejecuta el algoritmo proporcionado
func processModexHandler(w http.ResponseWriter, r *http.Request, algorithm func(*modex.Network) ([]byte, float64, float64, float64, error)) {
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

	processModex(w, network, algorithm)
}
