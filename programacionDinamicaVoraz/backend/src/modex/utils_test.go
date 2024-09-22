/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex/utils_test.go
 * Authors: Julián Ernesto Puyo Mora...2226905
 *          Cristian David Pacheco.....2227437
 *          Juan Sebastián Molina......2224491
 *          Juan Camilo Narváez Tascón.2140112
 * Creation date: 09/07/2024
 * Last modification: 09/21/2024
 * License: GNU-GPL
 */
package modex

import (
	"math"
	"testing"
)

var networks = []Network{
	{
		Agents: []Agent{
			{Opinion: 100, Receptivity: 0.5},
			{Opinion: 100, Receptivity: 0.1},
			{Opinion: -10, Receptivity: 0.1},
		},
		Resources: 55.0,
	},
	{
		Agents: []Agent{
			{Opinion: -30, Receptivity: 0.9},
			{Opinion: 40, Receptivity: 0.1},
			{Opinion: 50, Receptivity: 0.5},
		},
		Resources: 35.0,
	},
}

var strategies = [][]byte{
	{0, 0, 1},
	{1, 0, 0},
	{0, 1, 0},
	{1, 0, 1},
}

var moderations = []*Network{
	moderation(&networks[0], strategies[0]),
	moderation(&networks[0], strategies[1]),
	moderation(&networks[1], strategies[3]),
}

var tableEffort = []struct {
	network  Network
	strategy []byte
	expected float64
}{
	{networks[0], strategies[0], 9},
	{networks[0], strategies[1], 50},
	{networks[1], strategies[2], 36},
	{networks[1], strategies[3], 28},
}

var tableExtremism = []struct {
	extremismObtained float64
	expected          float64
}{
	{Extremism(moderations[0]), 47.14},
	{Extremism(moderations[1]), 33.49},
	{Extremism(moderations[2]), 13.33},
}

func TestEffort(t *testing.T) {
	for _, tt := range tableEffort {
		result, _ := Effort(&tt.network, tt.strategy)
		if result != tt.expected {
			t.Errorf("Effort(%v, %v) => %v, want %v", tt.network, tt.strategy, result, tt.expected)
		}
	}
}

func TestExtremism(t *testing.T) {
	for _, tt := range tableExtremism {
		if (math.Trunc(tt.extremismObtained*100) / 100) != tt.expected {
			t.Errorf("Extremism() => %v, want %v", tt.extremismObtained, tt.expected)
		}
	}
}
