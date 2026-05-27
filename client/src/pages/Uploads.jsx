import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const UploadsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");

  const [activityFilter, setActivityFilter] = useState("all");

  const [auditFilter, setAuditFilter] = useState("all");

  const [sourceFilter, setSourceFilter] = useState("all");

  const [search, setSearch] = useState("");

  const fetchUploads = async () => {
    try {
      const res = await api.get("/uploads/");

      setRecords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // UNIQUE VALUES FOR DROPDOWNS
  const uniqueActivities = [...new Set(records.map((r) => r.activity_type))];

  const uniqueStatuses = [...new Set(records.map((r) => r.status))];

  const uniqueSources = [...new Set(records.map((r) => r.source))];

  // FILTERED DATA
  const filteredRecords = useMemo(() => {
    return records.filter((row) => {
      const matchesStatus =
        statusFilter === "all" || row.status === statusFilter;

      const matchesActivity =
        activityFilter === "all" || row.activity_type === activityFilter;

      const matchesAudit =
        auditFilter === "all" ||
        (auditFilter === "audited" ? row.audited : !row.audited);

      const matchesSource =
        sourceFilter === "all" || row.source === sourceFilter;

      const matchesSearch =
        search === "" ||
        row.activity_type?.toLowerCase().includes(search.toLowerCase()) ||
        row.activity_details?.toLowerCase().includes(search.toLowerCase());

      return (
        matchesStatus &&
        matchesActivity &&
        matchesAudit &&
        matchesSource &&
        matchesSearch
      );
    });
  }, [
    records,
    statusFilter,
    activityFilter,
    auditFilter,
    sourceFilter,
    search,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading uploads...
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-10">Uploaded Normalized Data</h1>

        {/* FILTERS */}
        <div className="bg-white rounded-[32px] shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-5 gap-4">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search activity/details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                border
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                border
                rounded-xl
                px-4
                py-3
              "
            >
              <option value="all">All Status</option>

              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* ACTIVITY */}
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="
                border
                rounded-xl
                px-4
                py-3
              "
            >
              <option value="all">All Activity</option>

              {uniqueActivities.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>

            {/* AUDIT */}
            <select
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
              className="
                border
                rounded-xl
                px-4
                py-3
              "
            >
              <option value="all">All Audit</option>

              <option value="audited">Audited</option>

              <option value="not_audited">Not Audited</option>
            </select>

            {/* SOURCE */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="
                border
                rounded-xl
                px-4
                py-3
              "
            >
              <option value="all">All Source</option>

              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-[32px] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-5 text-left">Source</th>

                  <th className="p-5 text-left">Activity</th>

                  <th className="p-5 text-left">Details</th>

                  <th className="p-5 text-left">Quantity</th>

                  <th className="p-5 text-left">Unit</th>

                  <th className="p-5 text-left">Scope</th>

                  <th className="p-5 text-left">Status</th>

                  <th className="p-5 text-left">Audited</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-5">{row.source}</td>

                    <td className="p-5">{row.activity_type}</td>

                    <td className="p-5">{row.activity_details}</td>

                    <td className="p-5">{row.quantity}</td>

                    <td className="p-5">{row.unit}</td>

                    <td className="p-5">{row.scope}</td>

                    <td className="p-5">{row.status}</td>

                    <td className="p-5">{row.audited ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COUNT */}
        <p className="mt-5 text-slate-600">
          Showing <span className="font-bold">{filteredRecords.length}</span> of{" "}
          <span className="font-bold">{records.length}</span> records
        </p>
      </div>
    </div>
  );
};

export default UploadsPage;
