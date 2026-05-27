const UploadHeader = ({ source }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold capitalize">{source} Upload</h1>

      <p className="text-gray-600 mt-2">Upload CSV file for ingestion</p>
    </div>
  );
};

export default UploadHeader;
