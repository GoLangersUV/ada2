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
	"github.com/Krud3/ada2/programacionDinamicaVoraz/src/modex"
  "fmt"
)

// TestMain tests the main function of the ModEx program.
func main() {
  network := modex.Network{
    Agents: []modex.Agent{
      {Opinion: 100, Receptivity: 0.5},
      {Opinion: 100, Receptivity: 0.1},
      {Opinion: -10, Receptivity: 0.1},
    },
    Resources: 55,
  }

  minStrategy, minEffort, minExtremism := modex.ModexFB(&network)

  fmt.Println("Minimum Strategy:", minStrategy)
  fmt.Println("Minimum Effort:", minEffort)
  fmt.Println("Minimum Extremism:", minExtremism)
}
