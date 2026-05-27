import { useState } from "react";

const CSVUploader = () => {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    console.log(file);
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="
          mt-4
          bg-black
          text-white
          px-5
          py-2
          rounded-lg
        "
      >
        Upload CSV
      </button>
    </div>
  );
};

export default CSVUploader;
