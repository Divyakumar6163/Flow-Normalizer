import { useParams } from "react-router-dom";
import { FaIndustry, FaBolt, FaPlane, FaFileCsv } from "react-icons/fa";

import UploadHeader from "../components/upload/HeaderUploader";
import CSVUploader from "../components/upload/CSVUploader";

const sourceConfig = {
  sap: {
    title: "SAP Upload",
    description: "Upload fuel and procurement CSV exports from SAP systems.",
    icon: <FaIndustry />,
    color: "bg-emerald-500",
  },

  utility: {
    title: "Utility Upload",
    description:
      "Upload electricity billing and utility consumption CSV files.",
    icon: <FaBolt />,
    color: "bg-blue-500",
  },

  travel: {
    title: "Travel Upload",
    description:
      "Upload business travel records including flights, hotels and transport.",
    icon: <FaPlane />,
    color: "bg-violet-500",
  },
};

const UploadPage = () => {
  const { source } = useParams();

  const currentSource = sourceConfig[source] || sourceConfig.sap;

  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
        {/* HERO */}
        <section
          className="
            grid
            lg:grid-cols-2
            gap-10
            items-center
            mb-12
          "
        >
          {/* LEFT */}
          <div>
            <span
              className="
                inline-flex
                items-center
                gap-2
                bg-slate-100
                text-slate-700
                px-4
                py-2
                rounded-full
                text-sm
                font-medium
              "
            >
              <FaFileCsv />
              CSV Ingestion Pipeline
            </span>

            <h1
              className="
                text-4xl
                md:text-6xl
                font-black
                mt-6
                leading-tight
              "
            >
              Upload &<span className="text-emerald-500"> Validate</span>
              <br />
              ESG Data
            </h1>

            <p
              className="
                text-slate-500
                text-lg
                leading-8
                mt-6
                max-w-2xl
              "
            >
              Upload CSV files, validate rows, identify suspicious records and
              prepare them for analyst review.
            </p>

            <div className="mt-10">
              <UploadHeader source={source} />
            </div>
          </div>

          {/* RIGHT CARD */}
          <div
            className="
              bg-white/80
              backdrop-blur-xl
              rounded-[40px]
              p-8
              border
              border-white
              shadow-xl
            "
          >
            <div
              className={`
                h-20
                w-20
                rounded-[28px]
                flex
                items-center
                justify-center
                text-white
                text-3xl
                shadow-lg
                ${currentSource.color}
              `}
            >
              {currentSource.icon}
            </div>

            <h2 className="text-3xl font-bold mt-6">{currentSource.title}</h2>

            <p className="text-slate-500 mt-4 leading-8">
              {currentSource.description}
            </p>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-slate-100 rounded-3xl p-5">
                <p className="text-sm text-slate-500">Accepted Format</p>

                <h3 className="font-bold text-xl mt-2">CSV</h3>
              </div>

              <div className="bg-slate-100 rounded-3xl p-5">
                <p className="text-sm text-slate-500">Validation</p>

                <h3 className="font-bold text-xl mt-2">Enabled</h3>
              </div>
            </div>
          </div>
        </section>

        {/* UPLOADER */}
        <section>
          <CSVUploader />
        </section>
      </div>
    </div>
  );
};

export default UploadPage;
