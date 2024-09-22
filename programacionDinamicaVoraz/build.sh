#!/bin/bash

# Build frontend
cd frontend
npm run build
cd ..

# Function to create distribution package
create_dist() {
    local OS=$1
    local EXT=$2
    local DIST_DIR="dist-$OS"
    
    # Create distribution directory
    mkdir -p "$DIST_DIR/uploads"
    
    # Copy executable
    cp "app-$OS$EXT" "$DIST_DIR/"
    
    # Create README file
    cat > "$DIST_DIR/README.txt" << EOL
Dynamic Programming and Greedy Algorithms Application

To run the application:
1. Double-click on the executable file (app-$OS$EXT).
2. Open your web browser and go to http://localhost:3000

The application will start both the backend server (on port 8080) and serve the frontend (on port 3000).

Note: If your firewall prompts you, please allow the application to access the network.
EOL

    # Create zip archive
    zip -r "app-$OS.zip" "$DIST_DIR"
    
    # Clean up
    rm -r "$DIST_DIR"
}

# Build for Linux
GOOS=linux GOARCH=amd64 go build -o app-linux main.go
create_dist "linux" ""

# Build for macOS
GOOS=darwin GOARCH=amd64 go build -o app-mac main.go
create_dist "mac" ""

# Build for Windows
GOOS=windows GOARCH=amd64 go build -o app-windows.exe main.go
create_dist "windows" ".exe"

echo "Build complete. Distribution packages created for Linux, macOS, and Windows."
