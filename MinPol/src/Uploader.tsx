import * as React from "react";
import {
  FileMosaic,
  UPLOADSTATUS,
  useFakeProgress,
} from "@files-ui/react";

const DemoFileMosaicUploadStatus = () => {
  const progress = useFakeProgress();

  const [status1, setStatus1] = React.useState("uploading");
  const [status2, setStatus2] = React.useState("uploading");
  const [status3, setStatus3] = React.useState("uploading");

  React.useEffect(() => {
    //schedule an interval
    const _myInterval = setInterval(() => {
      //set the uploadstatus result
      setStatus1((_status) => setNextUploadState(_status, "aborted"));
      setStatus2((_status) => setNextUploadState(_status, "error"));
      setStatus3((_status) => setNextUploadState(_status, "success"));
    }, 5000);

    //clean
    return () => {
      console.log("clear interval", _myInterval);
      clearInterval(_myInterval);
    };
  }, []);

  const handleCancel = (id) => {
    console.log("Upload canceled in file: " + id);
  };
  const handleAbort = (id) => {
    console.log("Upload aborted in file: " + id);
  };
  return (
    <>
      <FlexRowContainer>
        <FileMosaic {...preparingFile} />
        <FileMosaic {...preparingFile} onCancel={handleCancel} />
      </FlexRowContainer>
      <br/>
      <FlexRowContainer>
        <FileMosaic {...uploadingFile} />
        <FileMosaic {...uploadingFile} progress={progress} />
        <FileMosaic {...uploadingFile} onAbort={handleAbort} />
        <FileMosaic {...uploadingFile} onAbort={handleAbort} progress={progress} />
      </FlexRowContainer>
      <br/>
      <FlexRowContainer>
        <FileMosaic {...uploadResultFiles[0]} uploadStatus={status1} />
        <FileMosaic {...uploadResultFiles[1]} uploadStatus={status2} />
        <FileMosaic {...uploadResultFiles[2]} uploadStatus={status3} />
      </FlexRowContainer>
    </>
  );
};
export default DemoFileMosaicUploadStatus;

const FlexRowContainer = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};

const setNextUploadState = (
  prevState,
  nextStatus
) => {
  if (prevState === "uploading") return nextStatus;
  else return "uploading";
};

const preparingFile = {
  id: "fileId-0",
  size: 28 * 1024 * 1024,
  type: "text/plain",
  name: "preparing file.jsx",
  uploadStatus: "preparing",
};

const uploadingFile = {
  id: "fileId-1",
  size: 28 * 1024 * 1024,
  type: "image/png",
  name: "uploading file.png",
  uploadStatus: "uploading",
};

const uploadResultFiles = [
  {
    id: "fileId-2",
    size: 28 * 1024 * 1024,
    type: "image/gif",
    name: "upload aborted file.gif",
    uploadMessage: "Upload was aborted by the user",
  },
  {
    id: "fileId-3",
    size: 28 * 1024 * 1024,
    type: "image/jpeg",
    name: "upload with error file.jpg",
    uploadMessage:
      "File couldn't be uploaded to Files-ui earthquakes. File was too big.",
  },
  {
    id: "fileId-4",
    size: 28 * 1024 * 1024,
    type: "image/png",
    name: "successfully uploaded file.png",
    uploadMessage: "File was uploaded correctly to Files-ui earthquakes",
  },
];