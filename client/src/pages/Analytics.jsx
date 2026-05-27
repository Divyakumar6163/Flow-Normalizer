import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import { useEffect, useState } from "react";

import api from "../services/api";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

const AnalyticsPage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await api.get("/uploads/");

    setRecords(res.data);
  };

  // SOURCE DISTRIBUTION
  const sourceData = ["sap", "utility", "travel"].map((source) => ({
    name: source,
    value: records.filter((r) => r.source === source).length,
  }));

  // STATUS DISTRIBUTION
  const statusMap = {};

  records.forEach((r) => {
    statusMap[r.status] = (statusMap[r.status] || 0) + 1;
  });

  const statusData = Object.entries(statusMap).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  // SCOPE DISTRIBUTION
  const scopeMap = {};

  records.forEach((r) => {
    scopeMap[r.scope] = (scopeMap[r.scope] || 0) + 1;
  });

  const scopeData = Object.entries(scopeMap).map(([k, v]) => ({
    scope: k,
    count: v,
  }));

  // TOTAL QUANTITY
  const quantityBySource = ["sap", "utility", "travel"].map((source) => ({
    source,
    quantity: records
      .filter((r) => r.source === source)
      .reduce((sum, row) => sum + Number(row.quantity), 0),
  }));

  // AUDIT STATUS
  const auditedData = [
    {
      name: "Audited",
      value: records.filter((r) => r.audited).length,
    },
    {
      name: "Not Audited",
      value: records.filter((r) => !r.audited).length,
    },
  ];

  return (
    <div className="min-h-screen p-8 gradient-bg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-black mb-8">ESG Analytics Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-5 mb-8">
          <Card title="Total Records" value={records.length} />

          <Card title="Audited" value={auditedData[0].value} />

          <Card
            title="Failed"
            value={records.filter((r) => r.status === "failed").length}
          />

          <Card
            title="Approved"
            value={records.filter((r) => r.status === "approved").length}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ChartCard title="Source Distribution">
            <PieComponent data={sourceData} />
          </ChartCard>

          <ChartCard title="Status Distribution">
            <PieComponent data={statusData} />
          </ChartCard>

          <ChartCard title="Audited vs Not Audited">
            <PieComponent data={auditedData} />
          </ChartCard>

          <ChartCard title="Scope Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scopeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scope" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Quantity by Source">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quantityBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

const PieComponent = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie data={data} dataKey="value" label>
        {data.map((entry, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>

      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

const Card = ({ title, value }) => (
  <div className="bg-white rounded-3xl p-6 shadow">
    <p className="text-slate-500">{title}</p>

    <h2 className="text-4xl font-bold mt-2">{value}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-3xl shadow p-6">
    <h2 className="text-xl font-bold mb-4">{title}</h2>

    {children}
  </div>
);

export default AnalyticsPage;
