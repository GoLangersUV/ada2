package modex

import (
	"bufio"
	"errors"
	"os"
	"strconv"
	"strings"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/src/models"
)

func NetworkFromLoadedFiles(filename string) (models.Network, error) {
	file, err := os.Open(filename)
	if err != nil {
		return models.Network{}, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	scanner.Scan()

	var agents []models.Agent
	for scanner.Scan() {
		line := scanner.Text()
		if len(line) == 0 {
			continue
		}

		if strings.Count(line, ",") == 0 {
			resources, err := strconv.ParseUint(line, 10, 64)
			if err != nil {
				return models.Network{}, err
			}

			return models.Network{Agents: agents, Resources: resources}, nil
		}

		parts := strings.Split(line, ",")
		opinion, err := strconv.ParseInt(parts[0], 10, 8)
		if err != nil {
			return models.Network{}, err
		}
		receptivity, err := strconv.ParseFloat(parts[1], 64)
		if err != nil {
			return models.Network{}, err
		}

		agent := models.Agent{Opinion: int8(opinion), Receptivity: receptivity}
		agents = append(agents, agent)
	}

	if err := scanner.Err(); err != nil {
		return models.Network{}, err
	}

	return models.Network{}, errors.New("file parsing error: could not determine resources")
}
