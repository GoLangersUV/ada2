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
//   - err: An error value, if any.
func ModexPD(network *Network) ([]byte, float64, float64, error) {
	resources := int(network.Resources)
	agents := network.Agents
	numAgents := len(agents)

	// Allocate space for the subproblem matrix
	svMatrix := make([][]int64, numAgents)
	for i := range svMatrix {
		svMatrix[i] = make([]int64, resources+1)
	}

	// Initialize the first row of the matrix (base case)
	agent0Effort := int(partialEffort(agents[0]))
	for resource_i := 1; resource_i <= resources; resource_i++ {
		if resource_i >= agent0Effort {
			svMatrix[0][resource_i] = partialExtremism(agents[0])
		}
	}

	// Fill the matrix with the subproblem solutions
	for agent_i := 1; agent_i < numAgents; agent_i++ {
		agent := agents[agent_i]
		partial_effort := int(partialEffort(agent))
		partial_extremism := partialExtremism(agent)

		for resource_i := 1; resource_i <= resources; resource_i++ {
			if partial_effort <= resource_i {
				svMatrix[agent_i][resource_i] = max(svMatrix[agent_i-1][resource_i], svMatrix[agent_i-1][resource_i-partial_effort]+partial_extremism)
			} else {
				svMatrix[agent_i][resource_i] = svMatrix[agent_i-1][resource_i]
			}
		}
	}

	// Reconstruct the strategy from the matrix
	strategy := make([]byte, numAgents)
	for agent_i := numAgents - 1; agent_i >= 0; agent_i-- {
		agent := agents[agent_i]
		effort := int(partialEffort(agent))

		if agent_i == 0 {
			if resources >= effort && svMatrix[0][resources] != 0 {
				strategy[0] = 1
			}
		} else if resources >= effort && svMatrix[agent_i][resources] != svMatrix[agent_i-1][resources] {
			strategy[agent_i] = 1
			resources -= effort
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
func ModexV(network *Network) ([]byte, float64, float64, error) {
	if network == nil || len(network.Agents) == 0 {
		return nil, 0, 0, errors.New("network is nil or has no agents")
	}

	// Generate the greedy strategy.
	strategy := greedyStrategy(network)

	// Calculate the total effort and the moderated network.
	totalEffort, moderatedNetwork := effort(network, strategy)

	// Check if the total effort exceeds the available resources.
	if uint64(totalEffort) > network.Resources {
		return nil, 0, 0, errors.New("insufficient resources to apply the strategy")
	}

	// Calculate the new extremism after applying the strategy.
	newExtremism := extremism(moderatedNetwork)

	return strategy, totalEffort, newExtremism, nil
}
