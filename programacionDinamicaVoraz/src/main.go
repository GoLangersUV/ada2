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
	"fmt"
	"log"
	"net/http"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/src/models"
	"github.com/Krud3/ada2/programacionDinamicaVoraz/src/modex"
	"github.com/Krud3/ada2/programacionDinamicaVoraz/src/view/pages"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

// TestMain tests the main function of the ModEx program.
func main() {
	fmt.Println("ModEx Program")
	// Serve static files like styles.css and images
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/ws", wsHandler)

	http.ListenAndServe(":8080", nil)
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	pages.Layout().Render(r.Context(), w)
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	log.Println("Received connection request from: " + r.RemoteAddr)

	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins
		},
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not open WebSocket connection", http.StatusBadRequest)
		return
	}
	log.Println("Connection established, before of calculatedStratgy")
	//go calculateStrategy(conn)
	for {
		// Read the first message (assumed to be file metadata)
		_, fileNameBytes, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading file name:", err)
			break
		}
		fileName := string(fileNameBytes) // Interpret the byte slide as a string

		// Read the second message (the file contents as binary)
		_, fileContent, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading file content:", err)
			break
		}
		parsingFileChannel := make(chan models.Network, 10)

		go modex.NetworkFromLoadedFiles(
			models.UploadedFile{Name: fileName,
				Content: fileContent}, parsingFileChannel)

		for network := range parsingFileChannel {
			log.Println("Network received: ", network)
		}
	}
}

func calculateStrategy(conn *websocket.Conn) {
	bestStrategy, minEffort, minExtremism, _ := launchBruteForce()

	result := models.BruteForceResult{
		BestStrategy: bestStrategy,
		BestEffort:   minEffort,
		MinExtremism: minExtremism,
		Error:        "",
	}
	resultJSON, jsonErr := json.Marshal(result)
	if jsonErr != nil {
		log.Println("Failed to serialize the result:", jsonErr)
		return
	}

	// Send the result over WebSocket
	if writeErr := conn.WriteMessage(websocket.TextMessage, resultJSON); writeErr != nil {
		log.Println("Failed to send the result over WebSocket:", writeErr)
	}

	log.Println("Task completed!")
	conn.WriteMessage(websocket.TextMessage, []byte("Task completed!"))
	defer conn.Close()
}

/*
42,0.9128290988596333
50,0.6089488930676293
56,0.7866686306091604
40,0.30487602574052586
-66,0.6565268721665228
83,0.6401715016422259
44,0.4362664846714599
71,0.7072171911236341
-94,0.1451081123931307
74,0.33863701065570295
73
*/

func launchBruteForce() (bestStrategy []byte, bestEffort float64, minExtremism float64, err error) {
	network := models.Network{
		Agents: []models.Agent{
			{Opinion: 42, Receptivity: 0.9128290988596333},
			{Opinion: 50, Receptivity: 0.6089488930676293},
			{Opinion: 56, Receptivity: 0.7866686306091604},
			{Opinion: 40, Receptivity: 0.30487602574052586},
			{Opinion: -66, Receptivity: 0.6565268721665228},
			{Opinion: 83, Receptivity: 0.6401715016422259},
			{Opinion: 44, Receptivity: 0.4362664846714599},
			{Opinion: 71, Receptivity: 0.7072171911236341},
			{Opinion: -94, Receptivity: 0.1451081123931307},
			{Opinion: 74, Receptivity: 0.33863701065570295},
		},
		Resources: 73.0,
	}

	minStrategy, minEffort, minExtremism, err := modex.ModexFB(&network)
	if err != nil {
		fmt.Println("Error:", err)
		return nil, 0, 0, err
	}

	return minStrategy, minEffort, minExtremism, nil
}
func launchDynammicProgrammming() {
	network := models.Network{
		Agents: []models.Agent{
			{Opinion: 34, Receptivity: 0.5249591123887468},
			{Opinion: -97, Receptivity: 0.06662575262643888},
			{Opinion: -96, Receptivity: 0.9909023877685615},
			{Opinion: -5, Receptivity: 0.7095964332655594},
			{Opinion: 13, Receptivity: 0.5730892184411239},
			{Opinion: -77, Receptivity: 0.3990264318559328},
			{Opinion: 11, Receptivity: 0.9862096012203873},
			{Opinion: 65, Receptivity: 0.41386829191945196},
			{Opinion: -27, Receptivity: 0.6627728079835299},
			{Opinion: -45, Receptivity: 0.37708482008389566},
			{Opinion: 92, Receptivity: 0.12287758092115264},
			{Opinion: -85, Receptivity: 0.29319887852162296},
			{Opinion: 78, Receptivity: 0.0033000534752198885},
			{Opinion: -59, Receptivity: 0.7607528856502521},
			{Opinion: 4, Receptivity: 0.0647508445318502},
			{Opinion: -47, Receptivity: 0.5994834265364559},
			{Opinion: 97, Receptivity: 0.7588520698928425},
			{Opinion: 85, Receptivity: 0.2251905822498278},
			{Opinion: 2, Receptivity: 0.2450440390223817},
			{Opinion: -98, Receptivity: 0.6804499082649875},
		},
		Resources: 225.0,
	}

	minStrategy, minEffort, minExtremism, err := modex.ModexPD(&network)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	fmt.Println("Minimum Strategy:", minStrategy)
	fmt.Println("Minimum Effort:", minEffort)
	fmt.Println("Minimum Extremism:", minExtremism)
}
