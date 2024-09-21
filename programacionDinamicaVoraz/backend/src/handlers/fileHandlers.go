// backend/src/handlers/fileHandlers.go
package handlers

import (
    "bufio"
    "encoding/json"
    "errors"
    "io"
    "io/ioutil"
    "net/http"
    "os"
    "path/filepath"
    "strconv"
    "strings"

    "github.com/Krud3/ada2/programacionDinamicaVoraz/backend/src/modex"
)

// Manejador para subir archivos
func UploadHandler(w http.ResponseWriter, r *http.Request) {
    // Limitar el tamaño máximo del archivo (por ejemplo, 10MB)
    r.ParseMultipartForm(10 << 20)

    // Obtener el archivo desde el formulario
    file, handler, err := r.FormFile("file")
    if err != nil {
        http.Error(w, "Error al obtener el archivo", http.StatusBadRequest)
        return
    }
    defer file.Close()

    // Crear la carpeta 'uploads' si no existe
    os.MkdirAll("uploads", os.ModePerm)

    // Guardar el archivo en la carpeta 'uploads'
    filePath := filepath.Join("uploads", handler.Filename)
    dst, err := os.Create(filePath)
    if err != nil {
        http.Error(w, "Error al crear el archivo en el servidor", http.StatusInternalServerError)
        return
    }
    defer dst.Close()

    // Copiar el contenido del archivo subido al nuevo archivo en el servidor
    if _, err := io.Copy(dst, file); err != nil {
        http.Error(w, "Error al guardar el archivo", http.StatusInternalServerError)
        return
    }

    // Parsear el archivo y obtener la estructura Network
    network, err := parseNetworkFromFile(filePath)
    if err != nil {
        http.Error(w, "Error al parsear el archivo: "+err.Error(), http.StatusBadRequest)
        return
    }

    // Almacenar el Network en memoria
    networks[handler.Filename] = network

    // Enviar respuesta exitosa
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("Archivo subido y procesado exitosamente"))
}

// Manejador para listar los archivos disponibles
func FilesHandler(w http.ResponseWriter, r *http.Request) {
    files, err := ioutil.ReadDir("uploads/")
    if err != nil {
        http.Error(w, "Error al leer los archivos", http.StatusInternalServerError)
        return
    }

    var fileNames []string
    for _, file := range files {
        if !file.IsDir() && strings.HasSuffix(file.Name(), ".txt") {
            fileNames = append(fileNames, file.Name())
        }
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(fileNames)
}

// Manejador para obtener el Network de un archivo
func GetNetworkHandler(w http.ResponseWriter, r *http.Request) {
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

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(network)
}

// Función para parsear el archivo y obtener el Network
func parseNetworkFromFile(filePath string) (modex.Network, error) {
    file, err := os.Open(filePath)
    if err != nil {
        return modex.Network{}, err
    }
    defer file.Close()

    scanner := bufio.NewScanner(file)

    // Leer el número de agentes
    if !scanner.Scan() {
        return modex.Network{}, errors.New("El archivo está vacío o tiene un formato incorrecto")
    }
    nAgentsStr := strings.TrimSpace(scanner.Text())
    nAgents, err := strconv.Atoi(nAgentsStr)
    if err != nil {
        return modex.Network{}, errors.New("Error al leer el número de agentes: " + err.Error())
    }

    var agents []modex.Agent
    for i := 0; i < nAgents; i++ {
        if !scanner.Scan() {
            return modex.Network{}, errors.New("Número insuficiente de agentes en el archivo")
        }
        line := strings.TrimSpace(scanner.Text())
        parts := strings.Split(line, ",")
        if len(parts) != 2 {
            return modex.Network{}, errors.New("Formato incorrecto en la línea: " + line)
        }

        opinion, err := strconv.ParseInt(parts[0], 10, 8)
        if err != nil {
            return modex.Network{}, errors.New("Error al leer la opinión: " + err.Error())
        }
        receptivity, err := strconv.ParseFloat(parts[1], 64)
        if err != nil {
            return modex.Network{}, errors.New("Error al leer la receptividad: " + err.Error())
        }

        agent := modex.Agent{
            Opinion:     int8(opinion),
            Receptivity: receptivity,
        }
        agents = append(agents, agent)
    }

    // Leer el valor de los recursos
    if !scanner.Scan() {
        return modex.Network{}, errors.New("Falta el valor de los recursos en el archivo")
    }
    resourcesStr := strings.TrimSpace(scanner.Text())
    resources, err := strconv.ParseUint(resourcesStr, 10, 64)
    if err != nil {
        return modex.Network{}, errors.New("Error al leer los recursos: " + err.Error())
    }

    network := modex.Network{
        Agents:    agents,
        Resources: resources,
    }

    return network, nil
}

