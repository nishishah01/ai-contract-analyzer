import { useState } from 'react';

const TestAPI = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const token = localStorage.getItem("authToken");
      console.log("Token:", token);
      
      // Test 1: Check if backend is running
      const healthCheck = await fetch('http://127.0.0.1:8000/api/dashboard/aggregates/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log("Health check status:", healthCheck.status);
      
      if (healthCheck.ok) {
        const data = await healthCheck.json();
        setResult(`✅ Backend is running! Status: ${healthCheck.status}\nData: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Backend error! Status: ${healthCheck.status}\nResponse: ${await healthCheck.text()}`);
      }
    } catch (error) {
      console.error("Test error:", error);
      setResult(`❌ Connection failed: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-4">Backend API Test</h3>
      <button
        onClick={testBackend}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Backend Connection'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAPI;
