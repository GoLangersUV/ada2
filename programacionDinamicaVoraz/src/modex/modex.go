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
	"math"
  "errors"
)

// Agent represents an individual in the social network, with an opinion on a
// specific topic and a receptivity level.
type Agent struct {
	Opinion     int8 // -100 (disagreement) to 100 (agreement)
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
func ModexPD(network *Network) ([]byte, float64, float64) {
	return []byte("PD1"), 0.0, 0.0
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
