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
	"encoding/json"
	"log"
	"net/http"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex"
)

func byteSliceToIntSlice(b []byte) []int {
	intSlice := make([]int, len(b))
	for i, v := range b {
		intSlice[i] = int(v)
	}
	return intSlice
}

func processModex(network modex.Network, algorithm func(*modex.Network) ([]byte, float64, float64, error), w http.ResponseWriter) {
	minStrategy, minEffort, minExtremism, err := algorithm(&network)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	strategyInt := byteSliceToIntSlice(minStrategy)

	response := struct {
		Strategy  []int   `json:"strategy"`
		Effort    float64 `json:"effort"`
		Extremism float64 `json:"extremism"`
	}{
		Strategy:  strategyInt,
		Effort:    minEffort,
		Extremism: minExtremism,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func modexPDHandler(w http.ResponseWriter, r *http.Request) {
	var network modex.Network
	err := json.NewDecoder(r.Body).Decode(&network)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	processModex(network, modex.ModexPD, w)
}

func modexFBHandler(w http.ResponseWriter, r *http.Request) {
	var network modex.Network
	err := json.NewDecoder(r.Body).Decode(&network)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	processModex(network, modex.ModexFB, w)
}

func modexVHandler(w http.ResponseWriter, r *http.Request) {
	var network modex.Network
	err := json.NewDecoder(r.Body).Decode(&network)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	processModex(network, modex.ModexV, w)
}

func main() {
	http.HandleFunc("/modex/pd", modexPDHandler)
	http.HandleFunc("/modex/fb", modexFBHandler)
	http.HandleFunc("/modex/v", modexVHandler)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

