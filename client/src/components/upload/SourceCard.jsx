import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUpload, FaFileCsv } from "react-icons/fa";
import api from "../../services/api";

const SourceCard = ({ title, description, icon, source }) => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await api.post(`/upload/${source}/`, formData);

      console.log("UPLOAD RESPONSE:", response.data);

      // stop if backend failed
      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      const batchId =
        response.data.batch_id || response.data.batchId || response.data.id;

      if (!batchId) {
        console.error("Missing batch id", response.data);

        alert("Upload completed but no batch ID returned.");
        return;
      }

      navigate(`/review/${batchId}`);
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-[32px]
        bg-white
        p-8
        shadow-sm
        border
        border-slate-200
        hover:-translate-y-2
        hover:shadow-2xl
        transition-all
        duration-300
      "
    >
      <div
        className="
          absolute
          right-0
          top-0
          h-28
          w-28
          rounded-full
          bg-emerald-100
          blur-3xl
          opacity-70
        "
      />

      <div className="relative z-10">
        {/* ICON */}
        <div
          className="
            h-14
            w-14
            rounded-[20px]
            bg-emerald-500
            flex
            items-center
            justify-center
            text-white
            text-2xl
            shadow-lg
            mb-6
          "
        >
          {icon}
        </div>

        <h2 className="text-2xl font-bold">{title}</h2>

        <p className="text-slate-500 mt-3 leading-7">{description}</p>

        {/* FILE INPUT */}
        <label
          className="
            mt-8
            rounded-2xl
            border-2
            border-dashed
            border-slate-300
            hover:border-emerald-400
            transition
            p-5
            flex
            flex-col
            items-center
            justify-center
            cursor-pointer
            bg-slate-50
          "
        >
          <FaFileCsv className="text-3xl text-emerald-500 mb-3" />

          <span className="font-medium">Choose CSV File</span>

          <span className="text-sm text-slate-500 mt-1">Upload dataset</span>

          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
        </label>

        {/* FILE NAME */}
        {file && (
          <div
            className="
              mt-4
              bg-emerald-50
              border
              border-emerald-200
              rounded-2xl
              p-4
            "
          >
            <p className="text-sm text-slate-500">Selected File</p>

            <p className="font-semibold truncate">{file.name}</p>
          </div>
        )}

        {error && <p className="text-red-500 mt-3">{error}</p>}

        {/* BUTTON */}
        <button
          disabled={!file || loading}
          onClick={handleUpload}
          className={`
            mt-6
            w-full
            rounded-2xl
            py-4
            font-semibold
            flex
            items-center
            justify-center
            gap-3
            transition

            ${
              file
                ? `
                bg-black
                text-white
                hover:bg-slate-900
              `
                : `
                bg-slate-200
                text-slate-400
              `
            }
          `}
        >
          <FaUpload />

          {loading ? "Uploading..." : "Upload CSV"}
        </button>
      </div>
    </div>
  );
};

export default SourceCard;
