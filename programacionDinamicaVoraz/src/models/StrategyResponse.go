package models

import (
	"encoding/json"
	"fmt"
)

type RawBinary []byte
type BruteForceResult struct {
	BestStrategy RawBinary `json:"best_strategy"`
	BestEffort   float64   `json:"best_effort"`
	MinExtremism float64   `json:"min_extremism"`
	Error        string    `json:"error,omitempty"`
}

func (r RawBinary) MarshalJSON() ([]byte, error) {
	binaryStr := ""
	for _, b := range r {
		// Convert each byte to its binary representation (8-bit)
		binaryStr += fmt.Sprintf("%08b", b)
	}
	return json.Marshal(binaryStr)
}
