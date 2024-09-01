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

// Agent represents an individual in the social network, with an opinion on a
// specific topic and a receptivity level.
type Agent struct {
	Opinion     int8
	Receptivity float64
}

// Network represents a social network, composed of multiple agents and a total
// amount of resources.
type Network struct {
	Agents    []Agent
	Resources float64
}

// ModexFB calculates the minimum effort required to moderate the opinions of all
// agents in the network, using a Brute Force algorithm.
//
// Input:
//   - network: A Network struct representing the social network.
//
// Output:
//   - strategy: A byte slice representing the strategy used to moderate the opinions.
//   - effort: A float32 value representing the minimum effort required.
//   - extremism: A float32 value representing the total extremism in the network.
func ModexFB(network *Network) ([]byte, float32, float32) {
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
//   - effort: A float32 value representing the minimum effort required.
//   - extremism: A float32 value representing the total extremism in the network.
func ModexPD(network *Network) ([]byte, float32, float32) {
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
//   - effort: A float32 value representing the minimum effort required.
//   - extremism: A float32 value representing the total extremism in the network.
func ModexV(network *Network) ([]byte, float32, float32) {
	return []byte("V1"), 0.0, 0.0
}
