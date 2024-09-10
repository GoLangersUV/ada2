/*
 * File: utils.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/01/2024
 * License: GNU-GPL
 */
package modex

import (
	"math"
)

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
	}

	return &networkPrime
}

// effort calculates the effort of the network after applying the strategy. It returns a float64 value.
func effort(network *Network, strategy []byte) float64 {
	n := len(network.Agents)
	networkPrime := moderation(network, strategy)

	var effortValue float64
	for i := 0; i < n; i++ {
		diff := float64(network.Agents[i].Opinion - networkPrime.Agents[i].Opinion)
		effortValue += math.Ceil(math.Abs(diff) * (1 - network.Agents[i].Receptivity))
	}

	return effortValue
}

// strategyGenerator generates a slice of all posible strategies. It returns a slice of byte slices.
func StrategyGenerator(n int) [][]byte {
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
func partialExtremism(agent float64) float64 {
	return math.Sqrt(agent)
}

// partialEffort calculates the partial effort required for modering an agent. It returns a float64 value.
func partialEffort(agent Agent) uint64 {
	opinion_difference := float64(agent.Opinion - 0)
	return uint64(math.Ceil(math.Abs(opinion_difference) * (1 - agent.Receptivity)))
}
