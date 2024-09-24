/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex/modex.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */

// Package modex provides functions to moderate opinions in a social network
// using different algorithms and strategies.
package modex

import (
	"errors"
	"math"
	"time"
)

// Agent represents an individual in the social network, with an opinion on a
// specific topic and a receptivity level.
type Agent struct {
	Opinion     int8    `json:"opinion"`
	Receptivity float64 `json:"receptivity"`
}

// Network represents a social network, composed of multiple agents and a total
// amount of resources.
type Network struct {
	Agents    []Agent `json:"agents"`
	Resources uint64  `json:"resources"`
	Extremism float64 `json:"extremism"`
	Effort    float64 `json:"effort"`
}

// ModexFB calculates the minimum Effort required to moderate the opinions of all
// agents in the network, using a Brute Force algorithm. The time complexity of
// this algorithm is O(2^n), where n is the number of agents in the network.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - Effort: A float64 value representing the minimum Effort required.
//   - Extremism: A float64 value representing the total Extremism in the network.
//   - computationTime: A float64 value representing the time taken to compute the strategy.
//   - err: An error value, if any.
func ModexFB(network *Network) (bestStrategy []byte, bestEffort float64, minExtremism float64, computationTime float64, err error) {
	numAgents := len(network.Agents)

	if numAgents > 25 {
		return nil, 0, 0, 0, errors.New("In ModexFB the number of agents must be less than or equal to 25")
	}

	startTime := time.Now()

	var possibleStrategies [][]byte = strategyGenerator(numAgents)
	minExtremism = math.Inf(1)
	bestEffort = math.Inf(1)

	for _, strategy := range possibleStrategies {
		effortValue, networkPrime := Effort(network, strategy)
		if effortValue <= float64(network.Resources) {
			extremismValue := Extremism(networkPrime)
			if extremismValue < minExtremism {
				minExtremism = extremismValue
				bestEffort = effortValue
				bestStrategy = strategy
			}
		}
	}

	endTime := time.Now()
	computationTime = endTime.Sub(startTime).Seconds() // Tiempo en segundos

	return bestStrategy, bestEffort, minExtremism, computationTime, nil
}

// ModexPD calculates the minimum Effort required to moderate the opinions of all
// agents in the network, using a Dynamic Programming algorithm.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - Effort: A float64 value representing the minimum Effort required.
//   - Extremism: A float64 value representing the total Extremism in the network.
//   - computationTime: A float64 value representing the time taken to compute the strategy.
//   - err: An error value, if any.
func ModexPD(network *Network) ([]byte, float64, float64, float64, error) {
	resources := int(network.Resources)
	agents := network.Agents
	numAgents := len(agents)

  if resources >= numAgents*100 {
		strategy := make([]byte, numAgents)
		for i := 0; i < numAgents; i++ {
			strategy[i] = 1
		}

		startTime := time.Now()
		Effort, networkPrime := Effort(network, strategy)
		Extremism := Extremism(networkPrime)
		computationTime := time.Since(startTime).Seconds()

		return strategy, Effort, Extremism, computationTime, nil
	}

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

	startTime := time.Now()

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
		Effort := int(partialEffort(agent))

		if agent_i == 0 {
			if resources >= Effort && svMatrix[0][resources] != 0 {
				strategy[0] = 1
			}
		} else if resources >= Effort && svMatrix[agent_i][resources] != svMatrix[agent_i-1][resources] {
			strategy[agent_i] = 1
			resources -= Effort
		}
	}

	Effort, networkPrime := Effort(network, strategy)
	Extremism := Extremism(networkPrime)

	endTime := time.Now()
	computationTime := endTime.Sub(startTime).Seconds() // Tiempo en segundos
	return strategy, Effort, Extremism, computationTime, nil
}

// ModexV calculates the minimum Effort required to moderate the opinions of all
// agents in the network, using a Greedy algorithm.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - Effort: A float64 value representing the minimum Effort required.
//   - Extremism: A float64 value representing the total Extremism in the network.
//   - computationTime: A float64 value representing the time taken to compute the strategy.
//   - err: An error value, if any.
func ModexV(network *Network) ([]byte, float64, float64, float64, error) {
	if network == nil || len(network.Agents) == 0 {
		return nil, 0, 0, 0, errors.New("network is nil or has no agents")
	}

	// Generate the greedy strategy.
	resources := network.Resources
	strategy := make([]byte, len(network.Agents))
	totalEffort := 0.0

	startTime := time.Now()

	rankedAgents := rankAgents(network)

	for _, agentInfo := range rankedAgents {
		if uint64(totalEffort+agentInfo.Effort) <= resources {
			strategy[agentInfo.Index] = 1
			totalEffort += agentInfo.Effort
		} else {
			strategy[agentInfo.Index] = 0
		}
	}

	totalEffort, moderatedNetwork := Effort(network, strategy)

	if uint64(totalEffort) > network.Resources {
		return nil, 0, 0, 0, errors.New("insufficient resources to apply the strategy")
	}

	newExtremism := Extremism(moderatedNetwork)

	endTime := time.Now()

	computationTime := endTime.Sub(startTime).Seconds()

	return strategy, totalEffort, newExtremism, computationTime, nil
}
