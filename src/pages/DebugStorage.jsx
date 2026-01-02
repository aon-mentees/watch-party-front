import React from "react";

const DebugStorage = () => {
  const checkStorage = () => {
    console.log("=== LocalStorage Debug ===");
    console.log("authToken:", localStorage.getItem("authToken"));
    console.log("currentUser:", localStorage.getItem("currentUser"));
    console.log("All keys:", Object.keys(localStorage));
    
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("currentUser");
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      token: token || "Not found",
      user: user || "Not found",
    };
  };

  const [storage, setStorage] = React.useState(checkStorage());

  const handleRefresh = () => {
    setStorage(checkStorage());
  };

  const handleClear = () => {
    localStorage.clear();
    setStorage(checkStorage());
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔍 LocalStorage Debug</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Storage Status:</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">authToken:</p>
              <p className={`text-lg font-mono ${storage.hasToken ? "text-green-400" : "text-red-400"}`}>
                {storage.token.substring(0, 50)}...
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">currentUser:</p>
              <pre className="text-sm bg-gray-900 p-3 rounded overflow-auto max-h-40">
                {storage.user}
              </pre>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            🗑️ Clear Storage
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugStorage;
