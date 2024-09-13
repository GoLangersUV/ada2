/*
 * File: modex.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/11/2024
 * License: GNU-GPL
 */

// Package modex provides functions to moderate opinions in a social network
// using different algorithms and strategies.
package modex

import (
	"errors"
	"math"
)

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
// agents in the network, using a Brute Force algorithm. The time complexity of
// this algorithm is O(2^n), where n is the number of agents in the network.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - effort: A float64 value representing the minimum effort required.
//   - extremism: A float64 value representing the total extremism in the network.
//   - err: An error value, if any.
func ModexFB(network *Network) (bestStrategy []byte, bestEffort float64, minExtremism float64, err error) {
	numAgents := len(network.Agents)

	if numAgents > 25 {
		return nil, 0, 0, errors.New("In ModexFB the number of agents must be less than or equal to 25")
	}

	var possibleStrategies [][]byte = strategyGenerator(numAgents)
	minExtremism = math.Inf(1)
	bestEffort = math.Inf(1)

	for _, strategy := range possibleStrategies {
		effortValue, networkPrime := effort(network, strategy)
		if effortValue <= float64(network.Resources) {
			extremismValue := extremism(networkPrime)
			if extremismValue < minExtremism {
				minExtremism = extremismValue
				bestEffort = effortValue
				bestStrategy = strategy
			}
		}
	}

	return bestStrategy, bestEffort, minExtremism, nil
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
func ModexPD(network *Network) ([]byte, float64, float64, error) {
	resources := int(network.Resources)
	agents := network.Agents
	n := len(agents)

	svMatrix := make([][]int64, n)
	for i := range svMatrix {
		svMatrix[i] = make([]int64, resources+1)
	}

	for i := 0; i < n; i++ {
		svMatrix[i][0] = 0
	}

	agent0Effort := int(partialEffort(agents[0]))
	for w := 1; w <= resources; w++ {
		if w >= agent0Effort {
			svMatrix[0][w] = partialExtremism(agents[0])
		} else {
			svMatrix[0][w] = 0
		}
	}

	for i := 1; i < n; i++ {
		agent := agents[i]
		partial_effort := int(partialEffort(agent))
		partial_extremism := partialExtremism(agent)

		for w := 1; w <= resources; w++ {
			if partial_effort <= w {
				svMatrix[i][w] = max(svMatrix[i-1][w], svMatrix[i-1][w-partial_effort]+partial_extremism)
			} else {
				svMatrix[i][w] = svMatrix[i-1][w]
			}
		}
	}

	w := resources
	strategy := make([]byte, n)
	for i := n - 1; i >= 0; i-- {
		agent := agents[i]
		effort := int(partialEffort(agent))

		if i == 0 {
			if w >= effort && svMatrix[0][w] != 0 {
				strategy[0] = 1
			} else {
				strategy[0] = 0
			}
		} else if w >= effort && svMatrix[i][w] != svMatrix[i-1][w] {
			strategy[i] = 1
			w -= effort
		} else {
			strategy[i] = 0
		}
	}

	effort, networkPrime := effort(network, strategy)
	extremism := extremism(networkPrime)

	return strategy, effort, extremism, nil
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
