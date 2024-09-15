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
	"fmt"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/src/modex"
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
			{Opinion: 34, Receptivity: 0.5249591123887468},
			{Opinion: -97, Receptivity: 0.06662575262643888},
			{Opinion: -96, Receptivity: 0.9909023877685615},
			{Opinion: -5, Receptivity: 0.7095964332655594},
			{Opinion: 13, Receptivity: 0.5730892184411239},
			{Opinion: -77, Receptivity: 0.3990264318559328},
			{Opinion: 11, Receptivity: 0.9862096012203873},
			{Opinion: 65, Receptivity: 0.41386829191945196},
			{Opinion: -27, Receptivity: 0.6627728079835299},
			{Opinion: -45, Receptivity: 0.37708482008389566},
			{Opinion: 92, Receptivity: 0.12287758092115264},
			{Opinion: -85, Receptivity: 0.29319887852162296},
			{Opinion: 78, Receptivity: 0.0033000534752198885},
			{Opinion: -59, Receptivity: 0.7607528856502521},
			{Opinion: 4, Receptivity: 0.0647508445318502},
			{Opinion: -47, Receptivity: 0.5994834265364559},
			{Opinion: 97, Receptivity: 0.7588520698928425},
			{Opinion: 85, Receptivity: 0.2251905822498278},
			{Opinion: 2, Receptivity: 0.2450440390223817},
			{Opinion: -98, Receptivity: 0.6804499082649875},
		},
		Resources: 225.0,
	}

	minStrategy2, minEffort2, minExtremism2, err := modex.ModexFB(&network)
	minStrategy, minEffort, minExtremism, err := modex.ModexPD(&network)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

  fmt.Println("ModexPD------------------------------------")
	fmt.Println("Minimum Strategy:", minStrategy)
	fmt.Println("Minimum Effort:", minEffort)
	fmt.Println("Minimum Extremism:", minExtremism)
  fmt.Println("ModexFB------------------------------------")
	fmt.Println("Minimum Strategy:", minStrategy2)
	fmt.Println("Minimum Effort:", minEffort2)
	fmt.Println("Minimum Extremism:", minExtremism2)
}
