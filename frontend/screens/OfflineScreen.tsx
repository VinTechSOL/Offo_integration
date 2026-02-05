const OfflineScreen = ({ onRetry }: { onRetry: () => void }) => (
  <div className="h-full flex flex-col items-center justify-center bg-white px-6 text-center">
    <div className="text-6xl mb-4">📡</div>
    <h2 className="text-xl font-bold text-gray-800 mb-2">
      No Internet Connection
    </h2>
    <p className="text-gray-500 mb-6">
      Please check your network and try again.
    </p>
    <button
      onClick={onRetry}
      className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
    >
      Retry
    </button>
  </div>
);

export default OfflineScreen;
