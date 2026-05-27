import { FaIndustry, FaBolt, FaPlane } from "react-icons/fa";

import SourceCard from "../components/upload/SourceCard";
import StatCard from "../components/StatsCard";
import { SOURCES } from "../constants/sources";

const DashboardPage = () => {
  return (
    <div className="gradient-bg min-h-[90vh]">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">
        <section
          className="
            grid
            lg:grid-cols-2
            gap-10
            items-center
          "
        >
          <div>
            {/* <span
              className="
                bg-emerald-100
                text-emerald-700
                px-4
                py-2
                rounded-full
                text-sm
                font-medium
              "
            >
              ESG Data Intelligence
            </span> */}

            <h3
              className="
                text-3xl
                md:text-5xl
                font-black
                leading-tight
                mt-6
              "
            >
              Carbon Data
              <br />
              Review &<span className="text-emerald-500"> Normalization</span>
            </h3>

            <p
              className="
                mt-6
                text-lg
                text-slate-500
                leading-8
                max-w-2xl
              "
            >
              Upload SAP, utility and travel datasets. Detect suspicious
              records, review anomalies and approve rows before audit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Sources"
              value="3"
              subtitle="SAP / Utility / Travel"
            />

            <StatCard
              title="Audit Ready"
              value="100%"
              subtitle="Traceable ingestion"
            />

            <StatCard
              title="Validation"
              value="AI"
              subtitle="Smart row review"
            />
          </div>
        </section>

        <section className="mt-10">
          {/* <div className="flex items-center justify-between flex-wrap gap-5 mb-10">
            <div>
              <h2 className="text-4xl font-bold">Upload Sources</h2>

              <p className="text-slate-500 mt-2">
                Choose a source to ingest ESG data.
              </p>
            </div>
          </div> */}

          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            <SourceCard
              title="SAP Data"
              description="Fuel & procurement exports with plant codes, units and purchase records."
              source={SOURCES.SAP}
              icon={<FaIndustry />}
            />

            <SourceCard
              title="Utility Data"
              description="Electricity billing records, meters, tariffs and consumption."
              source={SOURCES.UTILITY}
              icon={<FaBolt />}
            />

            <SourceCard
              title="Travel Data"
              description="Corporate flights, hotels and ground transport exports."
              source={SOURCES.TRAVEL}
              icon={<FaPlane />}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
