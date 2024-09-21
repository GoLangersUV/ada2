// frontend/src/components/Header.tsx
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  subject: string;
  onFileSelect: (fileName: string) => void;
  selectedFile: string;
}

const Header: React.FC<HeaderProps> = ({ subject, onFileSelect, selectedFile }) => {
  const [fileList, setFileList] = useState<string[]>([]);

  // Función para obtener la lista de archivos desde el servidor
  const fetchFileList = async () => {
    try {
      const response = await fetch('http://localhost:8080/files');
      const files = await response.json();

      // Verificar que 'files' es un arreglo
      const filesList = Array.isArray(files) ? files : [];

      setFileList(filesList);

      if (filesList.length > 0) {
        // Si el archivo seleccionado no existe o no está en la lista, seleccionar el último
        if (!selectedFile || !filesList.includes(selectedFile)) {
          const lastFile = filesList[filesList.length - 1];
          onFileSelect(lastFile);
        }
      } else {
        // Si no hay archivos, limpiar la selección
        onFileSelect('');
      }
    } catch (error) {
      console.error('Error al obtener la lista de archivos:', error);
    }
  };

  // Llamar a fetchFileList cuando el componente se monta
  useEffect(() => {
    fetchFileList();
  }, []);

  // Función para abrir el diálogo de selección de archivos
  const openFileDialog = () => {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // Función para manejar la carga del archivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Crear FormData y añadir el archivo
      const formData = new FormData();
      formData.append('file', file);

      try {
        // Enviar el archivo al servidor
        const response = await fetch('http://localhost:8080/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          // Llamar a onFileSelect para actualizar el estado en App
          onFileSelect(file.name);
          // Actualizar la lista de archivos
          fetchFileList();
        } else {
          alert('Error al subir el archivo');
        }
      } catch (error) {
        console.error('Error al subir el archivo:', error);
        alert('Error al subir el archivo');
      }
    }
  };

  // Función para manejar la selección de archivo desde el desplegable
  const handleFileSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const fileName = event.target.value;
    onFileSelect(fileName);
  };

  return (
    <header className="flex flex-col text-lg items-center pt-10">
      <h2 className=" italic font-light">{subject}</h2>
      <h1 className="text-6xl flex mt-2">
        <img src="/logo.png" alt="Modex" className="w-12 mr-2 inline-block" />
        <span className="text-[#00ADD8]">Mod</span>ex
      </h1>
      <div className="file-loader my-8 flex gap-1">
        <select
          name="files"
          className="bg-[#333] w-72 border-2 rounded-md border-[#00ADD8]"
          id="file-select"
          onChange={handleFileSelect}
          value={selectedFile}
        >
          {fileList.map((file) => (
            <option value={file} key={file}>
              {file}
            </option>
          ))}
        </select>
        <button
          className="bg-[#00ADD8] rounded-md px-2 text-2xl font-bold text-white"
          onClick={openFileDialog}
        >
          +
        </button>
        {/* Input de archivo oculto */}
        <input
          type="file"
          id="file-input"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>
    </header>
  );
};

export default Header;

