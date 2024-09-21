/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex/utils.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
package modex

import (
	"math"
	"sort"
)

// AgentRatio holds the agent index along with its benefit-to-cost ratio.
type AgentRatio struct {
	Index   int
	Ratio   float64
	Effort  float64
	Benefit float64
}

// Extremism calculates the Extremism of the network. It returns a float64 value.
func Extremism(network *Network) float64 {
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

// Effort calculates the Effort of the network after applying the strategy. It returns the float64 value of the Effort and the network after applying the strategy.
func Effort(network *Network, strategy []byte) (float64, *Network) {
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

// partialExtremism calculates the partial Extremism of an agent. It returns a float64 value.
func partialExtremism(agent Agent) int64 {
	return int64(agent.Opinion) * int64(agent.Opinion)
}

// partialEffort calculates the partial Effort required for modering an agent. It returns a float64 value.
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

// rankAgents ranks agents based on their benefit-to-cost ratio.
func rankAgents(network *Network) []AgentRatio {
	agentRatios := make([]AgentRatio, len(network.Agents))

	for i, agent := range network.Agents {
		Extremism := float64(partialExtremism(agent))
		Effort := partialEffort(agent)
		var ratio float64
		if Effort == 0 {
			ratio = math.Inf(1)
		} else {
			ratio = Extremism / Effort
		}

		agentRatios[i] = AgentRatio{
			Index:   i,
			Ratio:   ratio,
			Effort:  Effort,
			Benefit: Extremism,
		}
	}

	sort.Slice(agentRatios, func(i, j int) bool {
		return agentRatios[i].Ratio > agentRatios[j].Ratio
	})

	return agentRatios
}
