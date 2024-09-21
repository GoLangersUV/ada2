// backend/src/handlers/modexHandlers.go
package handlers

import (
    "encoding/json"
    "net/http"

    "github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex"
)

var networks = make(map[string]modex.Network)

// Convierte un slice de bytes a un slice de enteros
func byteSliceToIntSlice(b []byte) []int {
    intSlice := make([]int, len(b))
    for i, v := range b {
        intSlice[i] = int(v)
    }
    return intSlice
}

func processModex(network modex.Network, algorithm func(*modex.Network) ([]byte, float64, float64, error), w http.ResponseWriter) {
    minStrategy, minEffort, minExtremism, err := algorithm(&network)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    strategyInt := byteSliceToIntSlice(minStrategy)

    response := struct {
        Strategy  []int   `json:"strategy"`
        Effort    float64 `json:"effort"`
        Extremism float64 `json:"extremism"`
    }{
        Strategy:  strategyInt,
        Effort:    minEffort,
        Extremism: minExtremism,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

func ModexPDHandler(w http.ResponseWriter, r *http.Request) {
    processModexHandler(w, r, modex.ModexPD)
}

func ModexFBHandler(w http.ResponseWriter, r *http.Request) {
    processModexHandler(w, r, modex.ModexFB)
}

func ModexVHandler(w http.ResponseWriter, r *http.Request) {
    processModexHandler(w, r, modex.ModexV)
}

func processModexHandler(w http.ResponseWriter, r *http.Request, algorithm func(*modex.Network) ([]byte, float64, float64, error)) {
    // Obtener el nombre del archivo desde los parámetros de la URL
    fileName := r.URL.Query().Get("file")
    if fileName == "" {
        http.Error(w, "Falta el parámetro 'file'", http.StatusBadRequest)
        return
    }

    network, exists := networks[fileName]
    if !exists {
        http.Error(w, "El archivo no existe o no ha sido procesado", http.StatusNotFound)
        return
    }

    processModex(network, algorithm, w)
}

