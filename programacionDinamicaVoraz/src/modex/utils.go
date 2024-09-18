/*
 * File: utils.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/11/2024
 * License: GNU-GPL
 */
package modex

import (
	"math"
	"sort"
)

// AgentRatio holds the agent index along with its benefit-to-cost ratio.
type AgentRatio struct {
	Index   int     // Index of the agent in the network.
	Ratio   float64 // Benefit-to-cost ratio.
	Effort  float64 // Effort required to moderate the agent.
	Benefit float64 // Benefit of moderating the agent.
}

// extremism calculates the extremism of the network. It returns a float64 value.
func extremism(network *Network) float64 {
	var sumOpinions float64

	for _, agent := range network.Agents {
		sumOpinions += float64(agent.Opinion) * float64(agent.Opinion)
	}

	return math.Sqrt(sumOpinions) / float64(len(network.Agents))
}

// moderation applies the strategy to the network. It returns the network after applying the strategy.
func moderation(network *Network, strategy []byte) *Network {
	networkPrime := Network{
		Agents:    make([]Agent, len(network.Agents)),
		Resources: network.Resources,
	}

	for i, strategyValue := range strategy {
		networkPrime.Agents[i].Opinion = network.Agents[i].Opinion - network.Agents[i].Opinion*int8(strategyValue)
		networkPrime.Agents[i].Receptivity = network.Agents[i].Receptivity
	}

	return &networkPrime
}

// effort calculates the effort of the network after applying the strategy. It returns the float64 value of the effort and the network after applying the strategy.
func effort(network *Network, strategy []byte) (float64, *Network) {
	n := len(network.Agents)
	networkPrime := moderation(network, strategy)

	var effortValue float64
	for i := 0; i < n; i++ {
		diff := float64(network.Agents[i].Opinion - networkPrime.Agents[i].Opinion)
		effortValue += math.Ceil(math.Abs(diff) * (1 - network.Agents[i].Receptivity))
	}

	return effortValue, networkPrime
}

// strategyGenerator generates a slice of all posible strategies for maximum 25 agents. It returns a slice of byte slices.
func strategyGenerator(n int) [][]byte {
	total := 1 << n
	combinations := make([][]byte, total)

	for i := 0; i < total; i++ {
		combination := make([]byte, n)
		for j := 0; j < n; j++ {
			combination[n-j-1] = byte((i >> j) & 1)
		}
		combinations[i] = combination
	}

	return combinations
}

// partialExtremism calculates the partial extremism of an agent. It returns a float64 value.
func partialExtremism(agent Agent) int64 {
	return int64(agent.Opinion) * int64(agent.Opinion)
}

// partialEffort calculates the partial effort required for modering an agent. It returns a float64 value.
func partialEffort(agent Agent) float64 {
	opinion_difference := float64(agent.Opinion)
	return math.Ceil(math.Abs(opinion_difference) * (1 - agent.Receptivity))
}

// min calculates the minimum of two int16 values. It returns a int16 value.
func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

// max calculates the maximum of two int16 values. It returns a int16 value.
func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}

// Function to generate the greedy strategy based on available resources.
func greedyStrategy(network *Network) []byte {
	resources := network.Resources
	strategy := make([]byte, len(network.Agents))
	totalEffort := 0.0

	rankedAgents := rankAgents(network)

	for _, agentInfo := range rankedAgents {
		if uint64(totalEffort+agentInfo.Effort) <= resources {
			// Moderate the agent.
			strategy[agentInfo.Index] = 1
			totalEffort += agentInfo.Effort
		} else {
			// Do not moderate the agent.
			strategy[agentInfo.Index] = 0
		}
	}

	return strategy
}

// Function to rank agents based on their benefit-to-cost ratio.
func rankAgents(network *Network) []AgentRatio {
	agentRatios := make([]AgentRatio, len(network.Agents))

	for i, agent := range network.Agents {
		benefit := float64(agent.Opinion) * float64(agent.Opinion)
		effort := partialEffort(agent)
		var ratio float64
		if effort == 0 {
			ratio = math.Inf(1) // Assign infinite ratio to agents with zero effort.
		} else {
			ratio = benefit / effort
		}

		agentRatios[i] = AgentRatio{
			Index:   i,
			Ratio:   ratio,
			Effort:  effort,
			Benefit: benefit,
		}
	}

	// Sort agents by descending ratio.
	sort.Slice(agentRatios, func(i, j int) bool {
		return agentRatios[i].Ratio > agentRatios[j].Ratio
	})

	return agentRatios
}
