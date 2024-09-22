/*
 * File: github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex/modex_test.go
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
	"bufio"
	"errors"
	"fmt"
	"math"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"
)

type TestCase struct {
	FileName       string
	NumAgents      int
	ExpectedValue  float64
	ExpectedResult string
}

// Tabla global con los valores de todas las pruebas
var testCases = []TestCase{
	{"Prueba1.txt", 5, 5.8, "Óptimo"},
	{"Prueba2.txt", 5, 21.557, "Óptimo"},
	{"Prueba3.txt", 10, 11.724, "Óptimo"},
	{"Prueba4.txt", 10, 15.717, "Óptimo"},
	{"Prueba5.txt", 20, 9.678, "Óptimo"},
	{"Prueba6.txt", 20, 11.481, "Óptimo"},
	{"Prueba7.txt", 35, 0.0, "Óptimo"},
	{"Prueba8.txt", 50, 3.652, "Óptimo"},
	{"Prueba9.txt", 50, 5.933, "Óptimo"},
	{"Prueba10.txt", 100, 2.419, "Óptimo"},
	{"Prueba11.txt", 100, 5.65, "Óptimo"},
	{"Prueba12.txt", 125, 4.037, "Óptimo"},
	{"Prueba13.txt", 125, 4.455, "Óptimo"},
	{"Prueba14.txt", 150, 4.242, "Óptimo"},
	{"Prueba15.txt", 200, 1.319, "Óptimo"},
	{"Prueba16.txt", 200, 1.727, "Óptimo"},
	{"Prueba17.txt", 300, 1.406, "Óptimo"},
	{"Prueba18.txt", 300, 3.955, "Óptimo"},
	{"Prueba19.txt", 350, 0.901, "Óptimo"},
	{"Prueba20.txt", 400, 1.406, "Óptimo"},
	{"Prueba21.txt", 500, 2.629, "Óptimo"},
	{"Prueba22.txt", 500, 1.524, "Óptimo"},
	{"Prueba23.txt", 750, 1.927, "Óptimo"},
	{"Prueba24.txt", 750, 0.973, "Óptimo"},
	{"Prueba25.txt", 800, 0.97, "Óptimo"},
	{"Prueba26.txt", 1000, 0.779, "Óptimo"},
	{"Prueba27.txt", 1500, 0.310, "Óptimo"},
	{"Prueba28.txt", 1500, 0.773, "Óptimo"},
	{"Prueba29.txt", 2000, 1.152, "Óptimo"},
	{"Prueba30.txt", 2500, 0.250, "Óptimo"},
	{"Prueba31.txt", 0.0, 1.352, "Óptimo"},
	{"Prueba32.txt", 0.0, 0.872, "Óptimo"},
	{"Prueba33.txt", 0.0, 1.207, "Óptimo"},
	{"Prueba34.txt", 0.0, 0.561, "Óptimo"},
	{"Prueba35.txt", 0.0, 0.449, "Óptimo"},
	{"Prueba36.txt", 0.0, 0.607, "Óptimo"},
	{"Prueba37.txt", 0.0, 0.253, "Óptimo"},
	{"Prueba38.txt", 0.0, 0.228, "Óptimo"},
	{"Prueba39.txt", 0.0, 0.224, "Solución"},
	{"Prueba40.txt", 0.0, 0.127, "Solución"},
	{"Prueba41.txt", 0.0, 0.0, "Óptimo"},
	{"Prueba42.txt", 0.0, 0.0, "Óptimo"},
	{"Prueba43.txt", 0.0, 0.0, "Óptimo"},
	{"Prueba44.txt", 0.0, 0.0, "Óptimo"},
	{"Prueba45.txt", 0.0, 0.0, "Óptimo"},
}

func truncateToThreeDecimals(value float64) float64 {
	return math.Trunc(value*1000) / 1000
}

func runTestCases(t *testing.T, functionToTest func(*Network) (float64, error), startFile, endFile int) {
	for _, testCase := range testCases {
		var fileNumber int
		_, err := fmt.Sscanf(testCase.FileName, "Prueba%d.txt", &fileNumber)
		if err != nil {
			t.Fatalf("Failed to parse file number from %s: %v", testCase.FileName, err)
		}

		if fileNumber < startFile || fileNumber > endFile {
			continue
		}

		t.Run(testCase.FileName, func(t *testing.T) {
			filePath := filepath.Join("./battery/Entradas", testCase.FileName)
			network, err := parseNetworkFromFile(filePath)
			if err != nil {
				t.Fatalf("Failed to parse file %s: %v", testCase.FileName, err)
			}

			minExtremism, err := functionToTest(&network)
			if err != nil {
				t.Fatalf("Error in functionToTest: %v", err)
			}

			minExtremism = truncateToThreeDecimals(minExtremism)
			expectedValue := truncateToThreeDecimals(testCase.ExpectedValue)

			if minExtremism != expectedValue {
				t.Errorf("For %s: expected minExtremism %.3f, got %.3f", testCase.FileName, expectedValue, minExtremism)
			} else {
				t.Logf("For %s: minExtremism is correct: %.3f", testCase.FileName, minExtremism)
			}
		})
	}
}

func parseNetworkFromFile(filename string) (Network, error) {
	file, err := os.Open(filename)
	if err != nil {
		return Network{}, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	scanner.Scan()

	var agents []Agent
	for scanner.Scan() {
		line := scanner.Text()
		if len(line) == 0 {
			continue
		}

		if strings.Count(line, ",") == 0 {
			resources, err := strconv.ParseUint(line, 10, 64)
			if err != nil {
				return Network{}, err
			}

			return Network{Agents: agents, Resources: resources}, nil
		}

		parts := strings.Split(line, ",")
		opinion, err := strconv.ParseInt(parts[0], 10, 8)
		if err != nil {
			return Network{}, err
		}
		receptivity, err := strconv.ParseFloat(parts[1], 64)
		if err != nil {
			return Network{}, err
		}

		agent := Agent{Opinion: int8(opinion), Receptivity: receptivity}
		agents = append(agents, agent)
	}

	if err := scanner.Err(); err != nil {
		return Network{}, err
	}

	return Network{}, errors.New("file parsing error: could not determine resources")
}

// Prueba para ModexFB
func TestModexFB(t *testing.T) {
	runTestCases(t, func(network *Network) (float64, error) {
		_, _, minExtremism, _, err := ModexFB(network)
		return minExtremism, err
	}, 1, 6)
}

// Prueba para ModexPD
func TestModexPD(t *testing.T) {
	runTestCases(t, func(network *Network) (float64, error) {
		_, _, minExtremism, _, err := ModexPD(network)
		// fmt.Printf("Strategy: %d\n", strategy)
		// fmt.Printf("Effort: %.3f\n", effort)
		return minExtremism, err
	}, 1, 34)
}

// Prueba para ModexV
func TestModexV(t *testing.T) {
	runTestCases(t, func(network *Network) (float64, error) {
		_, _, minExtremism, _, err := ModexV(network)
		// fmt.Printf("Strategy: %d\n", strategy)
		// fmt.Printf("Effort: %.3f\n", effort)
		return minExtremism, err
	}, 1, 45)
}
