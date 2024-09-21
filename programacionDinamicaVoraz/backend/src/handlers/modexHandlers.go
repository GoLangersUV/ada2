// backend/src/handlers/modexHandlers.go
package handlers

import (
    "encoding/json"
    "net/http"

    "github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex"
)

// Convierte un slice de bytes a un slice de enteros
func byteSliceToIntSlice(b []byte) []int {
    intSlice := make([]int, len(b))
    for i, v := range b {
        intSlice[i] = int(v)
    }
    return intSlice
}

// processModex es una función genérica que ejecuta el algoritmo proporcionado y envía la respuesta al cliente.
func processModex(w http.ResponseWriter, network modex.Network, algorithm func(*modex.Network) ([]byte, float64, float64, float64, error)) {
    minStrategy, minEffort, minExtremism, computationTime, err := algorithm(&network)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    strategyInt := byteSliceToIntSlice(minStrategy)

    response := struct {
        Strategy        []int   `json:"strategy"`
        Effort          float64 `json:"effort"`
        Extremism       float64 `json:"extremism"`
        ComputationTime float64 `json:"computationTime"`
    }{
        Strategy:        strategyInt,
        Effort:          minEffort,
        Extremism:       minExtremism,
        ComputationTime: computationTime,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// Handlers para cada algoritmo
func ModexFBHandler(w http.ResponseWriter, r *http.Request) {
  // check that population is less or equal to 25
    processModexHandler(w, r, modex.ModexFB)
}

func ModexPDHandler(w http.ResponseWriter, r *http.Request) {
    processModexHandler(w, r, modex.ModexPD)
}

func ModexVHandler(w http.ResponseWriter, r *http.Request) {
    processModexHandler(w, r, modex.ModexV)
}

// processModexHandler obtiene el network y ejecuta el algoritmo proporcionado
func processModexHandler(w http.ResponseWriter, r *http.Request, algorithm func(*modex.Network) ([]byte, float64, float64, float64, error)) {
    // Obtener el nombre del archivo desde los parámetros de la URL
    fileName := r.URL.Query().Get("file")
    if fileName == "" {
        http.Error(w, "Falta el parámetro 'file'", http.StatusBadRequest)
        return
    }

    networksMu.RLock()
    network, exists := networks[fileName]
    networksMu.RUnlock()
    if !exists {
        http.Error(w, "El archivo no existe o no ha sido procesado", http.StatusNotFound)
        return
    }

    processModex(w, network, algorithm)
}

