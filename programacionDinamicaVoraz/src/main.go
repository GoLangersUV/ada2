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

/* 
42,0.9128290988596333
50,0.6089488930676293
56,0.7866686306091604
40,0.30487602574052586
-66,0.6565268721665228
83,0.6401715016422259
44,0.4362664846714599
71,0.7072171911236341
-94,0.1451081123931307
74,0.33863701065570295
73
*/

func main() {
  network := modex.Network{
    Agents: []modex.Agent{
      {Opinion: 42, Receptivity: 0.9128290988596333},
      {Opinion: 50, Receptivity: 0.6089488930676293},
      {Opinion: 56, Receptivity: 0.7866686306091604},
      {Opinion: 40, Receptivity: 0.30487602574052586},
      {Opinion: -66, Receptivity: 0.6565268721665228},
      {Opinion: 83, Receptivity: 0.6401715016422259},
      {Opinion: 44, Receptivity: 0.4362664846714599},
      {Opinion: 71, Receptivity: 0.7072171911236341},
      {Opinion: -94, Receptivity: 0.1451081123931307},
      {Opinion: 74, Receptivity: 0.33863701065570295},
    },
    Resources: 73.0,
  }

  minStrategy, minEffort, minExtremism, err := modex.ModexFB(&network)
  if err != nil {
    fmt.Println("Error:", err)
    return
  }

  fmt.Println("Minimum Strategy:", minStrategy)
  fmt.Println("Minimum Effort:", minEffort)
  fmt.Println("Minimum Extremism:", minExtremism)
}
