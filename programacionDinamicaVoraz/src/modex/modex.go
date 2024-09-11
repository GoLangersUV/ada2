/*
 * File: modex.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/01/2024
 * License: GNU-GPL
 */

// Package modex provides functions to moderate opinions in a social network
// using different algorithms and strategies.
package modex

import "math"

// Agent represents an individual in the social network, with an opinion on a
// specific topic and a receptivity level.
type Agent struct {
	Opinion     int8    // -100 (disagreement) to 100 (agreement)
	Receptivity float64 // 0 (closed-minded) to 1 (open-minded)
}

// Network represents a social network, composed of multiple agents and a total
// amount of resources.
type Network struct {
	Agents    []Agent
	Resources uint64
}

// ModexFB calculates the minimum effort required to moderate the opinions of all
// agents in the network, using a Brute Force algorithm.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - effort: A float64 value representing the minimum effort required.
//   - extremism: A float64 value representing the total extremism in the network.
func ModexFB(network *Network) ([]byte, float64, float64) {
	return []byte("FB1"), 0.0, 0.0
}

// ModexPD calculates the minimum effort required to moderate the opinions of all
// agents in the network, using a Dynamic Programming algorithm.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - effort: A float64 value representing the minimum effort required.
//   - extremism: A float64 value representing the total extremism in the network.
func ModexPD(network *Network) ([]byte, float64, float64) {
	resources := network.Resources
	agents := network.Agents
	n := len(agents)

	// DP table (n+1 for agents, resources+1 for capacities)
	svMatrix := make([][]float64, n)
	for i := range svMatrix {
		svMatrix[i] = make([]float64, resources)
		for j := range svMatrix[i] {
			svMatrix[i][j] = math.Inf(1) // Initialize to a large value (infinity)
		}
	}

	// Initialize first agent explicitly without considering 0 agents
	agent0Effort := int(partialEffort(agents[0])) - 1
	for w := 0; w <= int(resources)-1; w++ {
		if w >= agent0Effort {
			svMatrix[0][w] = 0
		} else {
			svMatrix[0][w] = partialExtremism(agents[0])
		}
	}

	// Fill the DP table, now ensuring 0-based indexing
	for i := 0; i <= n-1; i++ {
		agent := agents[i]
		for w := 0; w <= int(resources)-1; w++ {
			effort := int(partialEffort(agent)) - 1
			if effort <= w {
				// Either take the current agent or leave it
				svMatrix[i][w] = min(svMatrix[i-1][w]+partialExtremism(agent), svMatrix[i-1][w-effort])
			} else {
				// Can't take the current agent, so copy the value from the previous row
				svMatrix[i][w] = svMatrix[i-1][w]
			}
		}
	}

	// The final result is in svMatrix[n][resources]
	extremism := math.Sqrt(svMatrix[n-1][int(resources)-1]) / float64(n)

	w := int(resources)
	strategy := make([]byte, n) // Create a strategy slice initialized to '0'
	for i := n - 1; i >= 0; i-- {
		agent := agents[i]
		effort := int(partialEffort(agent)) - 1

		// Check if the agent was moderated (compare current and previous row)
		if i == 0 {
			// Special case for the first agent (no previous row)
			if w >= effort && svMatrix[0][w] == 0 {
				strategy[0] = '1'
			} else {
				strategy[0] = '0'
			}
		} else if w >= effort && svMatrix[i][w] != svMatrix[i-1][w] {
			// Agent wasn't moderated, mark in strategy
			strategy[i] = '0'
			// Deduct the resources spent on this agent
			w -= effort
		} else {
			// Agent was moderated
			strategy[i] = '1'
		}
	}

	// Calculate the effort required
	effort := effort(network, strategy)

	return strategy, effort, extremism
}

// ModexV calculates the minimum effort required to moderate the opinions of all
// agents in the network, using a Greedy algorithm.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - effort: A float64 value representing the minimum effort required.
//   - extremism: A float64 value representing the total extremism in the network.
func ModexV(network *Network) ([]byte, float64, float64) {
	return []byte("V1"), 0.0, 0.0
}
