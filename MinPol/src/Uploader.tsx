import { Dropzone, ExtFile, FileMosaic, ValidateFileResponse } from "@files-ui/react";
import { useState } from "react";

const DropzoneFileLoader = () => {

	const [files, setFiles] = useState<ExtFile[]>([]);
	const updateFiles = (incommingFiles: ExtFile[]) => {
		//do something with the files
		setFiles(incommingFiles);
		//even your own upload implementation
	};
	const removeFile = (id: string | number | undefined) => {
		setFiles(files.filter((x: ExtFile) => x.id !== id));
	};

	const onUploadFinish = (uploadedFiles: ExtFile[]) => {
		const response = uploadedFiles[0].serverResponse?.payload
		if (response) {
			console.log(response)
		}
	}

	const myOwnDataValidation = (file: File): ValidateFileResponse => {
		let errorList: string[] = [];
		let validResult: boolean = true;
		const regExPrefix: RegExp = /^[\w,\s-]+\.(org|txt|csv|log|text|md)$/i;
		if (!file.name.match(regExPrefix)) {
			validResult = false;
			errorList.push('Prefix "test_file" was not present in the file name');
		}
		return { valid: validResult, errors: errorList };
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-evenly",
				gap: "40px",
				flexWrap: "wrap",
			}}
		>
			<Dropzone
				style={{ width: "400px" }}
				onChange={updateFiles}
				value={files}
				validator={myOwnDataValidation}
				footerConfig={{ customMessage: "Allow files in format txt" }}
				onUploadFinish={onUploadFinish}
				uploadConfig={{
					url: "http://localhost:3000/run-minizinc",
					method: "POST",
					headers: {
						Authorization:
							"bearer HTIBI/IBYG/&GU&/GV%&G/&IC%&V/Ibi76bfh8g67gg68g67i6g7G&58768&/(&/(FR&G/&H%&/",
					},
					autoUpload: true,
					cleanOnUpload: true,
				}}
			> {(files.length == 0) ? "Drag and drop a mnz file" :
				files.map((file: ExtFile) => (
					<FileMosaic key={file.id} {...file} onDelete={removeFile} info={true} />
				))}
			</Dropzone>
		</div>
	);
};
export default DropzoneFileLoader;
