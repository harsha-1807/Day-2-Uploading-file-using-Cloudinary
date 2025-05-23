import { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/files/upload", formData);
      setImageUrl(res.data.url);
      setError("");
    } catch (error) {
      setError("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginTop: "10px" }}>
        Upload
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p> }
      {imageUrl && <p style={{ color: "green" }}>File uploaded successfully!</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded file" />}
    </div>
  );
};

export default FileUpload;
