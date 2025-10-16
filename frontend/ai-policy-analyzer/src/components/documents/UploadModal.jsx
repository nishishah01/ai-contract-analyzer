import { useRef, useState } from "react";

const UploadModal = ({ onUpload }) => {
  const [show, setShow] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("file", file);

    await fetch("http://127.0.0.1:8000/api/documents/", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    setShow(false);
    setFile(null);
    onUpload && onUpload();
  };

  return (
    <>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShow(true)}
      >
        Upload Document
      </button>
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h3 className="font-bold mb-4">Upload Document</h3>
            <input
              type="file" 
              ref={inputRef}
              onChange={handleFileChange}
              className="mb-4"
            />
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleUpload}
                disabled={!file}
              >
                Upload
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShow(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadModal;