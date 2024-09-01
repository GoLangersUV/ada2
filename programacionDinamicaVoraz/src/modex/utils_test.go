// utils_test.go

package modex

import (
	"fmt"
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
  []byte{0, 0, 1},
  []byte{1, 0, 0},
  []byte{0, 1, 0},
  []byte{1, 0, 1},
}

var moderations = []Network{
  moderation(networks[0], strategies[0]),
  moderation(networks[0], strategies[1]),
  moderation(networks[1], strategies[3]),
}

var tableEffort = []struct {
  network Network 
  strategy []byte
  expected float64
}{
  {networks[0], strategies[0], 9},
  {networks[0], strategies[1], 50},
  {networks[1], strategies[2], 36},
  {networks[1], strategies[3], 28},
}

func TestEffort(t *testing.T) {
  fmt.Println("Effort Test")
  for _, tt := range tableEffort {
    result := effort(&tt.network, tt.strategy)
    if result != tt.expected {
      t.Errorf("Effort(%v, %v) => %v, want %v", tt.network, tt.strategy, result, tt.expected)
    }
  }
}

var tableExtremism = []struct {
  extremismObtained float64
  expected float64
}{
  {extremism(&moderations[0]), 47.14},
  {extremism(&moderations[1]), 33.49},
  {extremism(&moderations[2]), 13.33},
}

func TestExtremism(t *testing.T) {
  fmt.Println("Extremism Test")
  for _, tt := range tableExtremism {
    if (math.Trunc(tt.extremismObtained*100)/100) != tt.expected {
      t.Errorf("Extremism() => %v, want %v", tt.extremismObtained, tt.expected)
    }
  }
}

