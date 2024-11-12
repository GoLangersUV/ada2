// Uploader.jsx
import { Dropzone, ExtFile, FileMosaic, ValidateFileResponse } from "@files-ui/react";
import { useState } from "react";
import { ToastContainer, toast } from 'react-toastify'; // Importar react-toastify
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos de react-toastify

interface DropzoneFileLoaderProp {
    solver: string,
    onFileResponse?: (response: any) => void
}

const DropzoneFileLoader = ({ solver, onFileResponse }: DropzoneFileLoaderProp) => {

    const [files, setFiles] = useState<ExtFile[]>([]);

    const updateFiles = (incomingFiles: ExtFile[]) => {
        // Actualiza el estado con los nuevos archivos
        setFiles(incomingFiles);
    };

    const removeFile = (id: string | number | undefined) => {
        // Elimina un archivo del estado
        setFiles(files.filter((x: ExtFile) => x.id !== id));
    };

    const onUploadFinish = (uploadedFiles: ExtFile[]) => {
        const response = uploadedFiles[0].serverResponse;
        console.log("Respuesta completa del servidor en Uploader:", response);
        if (response) {
            if(onFileResponse) onFileResponse(response);
            setFiles([]); // Limpia el Dropzone después de una subida exitosa
			//removeFile(uploadedFiles[0].id); // Elimina el archivo del estado
            toast.success("✅ File uploaded successfully!", { // Mostrar mensaje de éxito con react-toastify
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    const myOwnDataValidation = (file: File): ValidateFileResponse => {
        let errorList: string[] = [];
        let validResult: boolean = true;
        const regExPrefix: RegExp = /^[\w,\s-]+\.(mpl|Mpl)$/i;
        if (!file.name.match(regExPrefix)) {
            validResult = false;
            errorList.push('El nombre del archivo debe terminar con ".mpl" o ".Mpl".');
        }
        return { valid: validResult, errors: errorList };
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column", // Cambiado a columna para colocar el mensaje debajo del Dropzone
                alignItems: "center",
                gap: "20px",
            }}
        >
            <Dropzone
                style={{ width: "400px" }}
                onChange={updateFiles}
                value={files}
                validator={myOwnDataValidation}
				maxFiles = {1}
				behaviour={"replace"}
                footerConfig={{ customMessage: "Formato permitido: .mpl" }}
                onUploadFinish={onUploadFinish}
                uploadConfig={{
                    url: `http://localhost:3000/run-minizinc`,
                    method: "POST",
					headers: {
						Authorization:
							"bearer HTIBI/IBYG/&GU&/GV%&G/&IC%&V/Ibi76bfh8g67gg68g67i6g7G&58768&/(&/(FR&G/&H%&/",
					},
                    autoUpload: true,
                }}
            > 
                {files.length === 0 
                    ? "Arrastra y suelta un archivo .mpl aquí" 
                    : files.map((file: ExtFile) => (
                        <FileMosaic key={file.id} {...file} onDelete={removeFile} info={true} />
                    ))
                }
            </Dropzone>

            {/* Contenedor de Toast */}
            <ToastContainer />
        </div>
    );
};
export default DropzoneFileLoader;
