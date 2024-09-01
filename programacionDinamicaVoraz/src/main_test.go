/*
 * File: main_test.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/01/2024
 * Last modification: 09/01/2024
 * License: GNU-GPL
 */
package main

import (
  "fmt"
  "testing"
  "github.com/Krud3/ada2/programacionDinamicaVoraz/src/modex"
)

// TestMain tests the main function of the ModEx program.
func TestMain(t *testing.T) {
  agents1 := []modex.Agent{
    {Opinion: 50, Receptivity: 0.5},
    {Opinion: -30, Receptivity: 0.8},
    {Opinion: 70, Receptivity: 0.3},
  }
  resources1 := 100.0
  network1 := modex.Network{
    Agents: agents1,
    Resources: resources1,
  }
  strFB1, effFB1, extFB1 := modex.ModexFB(&network1)
  fmt.Printf("strFB1: %v, effFB1: %v, extFB1: %v\n", strFB1, effFB1, extFB1)
}
