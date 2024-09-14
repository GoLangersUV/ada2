package modex

import (
	"bufio"
	"bytes"
	"strconv"
	"strings"

	"github.com/Krud3/ada2/programacionDinamicaVoraz/src/models"
)

func NetworkFromLoadedFiles(file models.UploadedFile, parsingChannel chan<- models.Network) {

	var agents []models.Agent
	// Convert the []byte to a bytes.Reader so that it can be scanned
	reader := bytes.NewReader(file.Content)
	// Create a new scanner to read line by line
	scanner := bufio.NewScanner(reader)

	for scanner.Scan() {
		// Each line is available via scanner.Text()
		line := scanner.Text()
		if len(line) == 0 {
			continue
		}

		// It is assumed that the line contains the resources in unique into the files
		if strings.Count(line, ",") == 0 {
			resources, err := strconv.ParseUint(line, 10, 64)
			if err != nil {
				parsingChannel <- models.Network{}
			}
			parsingChannel <- models.Network{Agents: agents, Resources: resources}
		}

		parts := strings.Split(line, ",")
		opinion, err := strconv.ParseInt(parts[0], 10, 8)
		if err != nil {
			parsingChannel <- models.Network{}
		}
		receptivity, err := strconv.ParseFloat(parts[1], 64)
		if err != nil {
			parsingChannel <- models.Network{}
		}

		agent := models.Agent{Opinion: int8(opinion), Receptivity: receptivity}
		agents = append(agents, agent)
	}
	if err := scanner.Err(); err != nil {
		parsingChannel <- models.Network{}
	}
}
