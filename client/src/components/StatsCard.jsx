const StatCard = ({ title, value, subtitle }) => {
  return (
    <div
      className="
        bg-white/80
        border
        border-white
        shadow-md
        rounded-3xl
        p-6
        hover:-translate-y-1
        transition
      "
    >
      <p className="text-slate-500 text-sm">{title}</p>

      <h2 className="text-4xl font-bold mt-2">{value}</h2>

      <p className="text-sm text-slate-500 mt-3">{subtitle}</p>
    </div>
  );
};

export default StatCard;
