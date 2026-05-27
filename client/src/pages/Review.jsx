import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaTrash,
  FaEdit,
  FaCheck,
} from "react-icons/fa";

import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import api from "../services/api";

const StatusBadge = ({ status }) => {
  const styles = {
    valid: "bg-emerald-100 text-emerald-700",

    suspicious: "bg-yellow-100 text-yellow-700",

    failed: "bg-red-100 text-red-700",

    approved: "bg-blue-100 text-blue-700",

    rejected: "bg-slate-200 text-slate-700",
  };

  const icons = {
    valid: <FaCheckCircle />,
    suspicious: <FaExclamationTriangle />,

    failed: <FaTimesCircle />,

    approved: <FaCheckCircle />,

    rejected: <FaTimesCircle />,
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        px-4
        py-2
        rounded-full
        text-sm
        font-medium
        ${styles[status]}
      `}
    >
      {icons[status]}
      {status}
    </span>
  );
};

const ReviewPage = () => {
  const { batchId } = useParams();

  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    const res = await api.get(`/review/${batchId}/`);

    setRecords(res.data);
  };

  useEffect(() => {
    fetchRecords();
  }, []); // eslint-disable-line

  const approveRecord = async (id) => {
    try {
      await api.patch(`/record/${id}/`, {
        status: "approved",
      });

      fetchRecords();
    } catch (err) {
      alert(err?.response?.data?.error || "Cannot update audited record.");
    }
  };

  const rejectRecord = async (id) => {
    try {
      await api.patch(`/record/${id}/`, {
        status: "rejected",
      });

      fetchRecords();
    } catch (err) {
      alert(err?.response?.data?.error || "Cannot update audited record.");
    }
  };

  const deleteRecord = async (id) => {
    try {
      await api.delete(`/record/${id}/`);

      fetchRecords();
    } catch (err) {
      alert(err?.response?.data?.error || "Cannot delete audited record.");
    }
  };

  const editRecord = async (row) => {
    const value = prompt("Edit quantity", row.quantity);

    if (value === null || value === "" || isNaN(value) || Number(value) <= 0)
      return;
    try {
      await api.patch(`/record/${row.id}/`, {
        quantity: Number(value),
      });

      fetchRecords();
    } catch (err) {
      alert(err?.response?.data?.error || "Cannot update audited record.");
    }
  };

  const finalAudit = async () => {
    const confirmed = window.confirm(
      "Final audit permanently locks this batch.\n\nYou will NOT be able to edit, approve, reject, or delete records afterward.\n\nContinue?",
    );

    if (!confirmed) return;

    try {
      await api.post(`/audit/${batchId}/`);

      alert("Audit completed. Batch locked.");

      fetchRecords();
    } catch (err) {
      alert(err?.response?.data?.error || "Audit failed");
    }
  };

  return (
    <div className="gradient-bg min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-black">Review Records</h1>

          <button
            onClick={finalAudit}
            // disabled={records.some((r) => r.audited)}
            className="
              bg-emerald-600
              text-white
              px-6
              py-4
              rounded-2xl
              font-semibold
            "
          >
            Final Audit
          </button>
        </div>

        <div className="bg-white rounded-[32px] overflow-hidden shadow-lg">
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

                  <th className="p-5 text-left">Issue</th>

                  <th className="p-5 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {records.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-5">{row.source}</td>

                    <td>{row.activity_type}</td>

                    <td>{row.activity_details}</td>

                    <td>{row.quantity}</td>

                    <td>{row.unit}</td>

                    <td>{row.scope}</td>

                    <td className="p-5">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="p-5">{row.issue}</td>

                    <td className="p-5 flex gap-3">
                      <button onClick={() => editRecord(row)}>
                        <FaEdit />
                      </button>

                      <button onClick={() => approveRecord(row.id)}>
                        <FaCheck />
                      </button>

                      <button onClick={() => rejectRecord(row.id)}>
                        <FaTimesCircle />
                      </button>

                      <button onClick={() => deleteRecord(row.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
