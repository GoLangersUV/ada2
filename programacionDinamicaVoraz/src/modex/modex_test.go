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
	{"Prueba14.txt", 150, 4.24, "Óptimo"},
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
	{"Prueba26.txt", 1000, 0.815, "Solución"},
	{"Prueba27.txt", 1500, 0.373, "Solución"},
	{"Prueba28.txt", 1500, 0.786, "Solución"},
	{"Prueba29.txt", 2000, 1.17, "Solución"},
	{"Prueba30.txt", 2500, 0.309, "Solución"},
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
		_, _, minExtremism, err := ModexFB(network)
		return minExtremism, err
	}, 1, 6)
}

// Prueba para ModexPD
func TestModexPD(t *testing.T) {
	runTestCases(t, func(network *Network) (float64, error) {
		_, _, minExtremism, err := ModexPD(network)
		return minExtremism, err
	}, 1, 30) // Por ejemplo, para un rango diferente de archivos
}
