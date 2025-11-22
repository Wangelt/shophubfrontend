'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TestUpload() {
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogs([]);
    addLog('📁 File selected: ' + file.name);
    addLog('📏 File size: ' + file.size + ' bytes');
    addLog('📋 File type: ' + file.type);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      addLog('❌ No access token found!');
      setStatus('ERROR: Not logged in');
      return;
    }
    addLog('🔑 Access token found');

    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'test');

    addLog('📤 Sending request to /api/v1/admin/upload');
    
    try {
      const response = await fetch('http://localhost:5000/api/v1/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      addLog(`📥 Response status: ${response.status} ${response.statusText}`);

      const data = await response.json();
      addLog('📦 Response data: ' + JSON.stringify(data, null, 2));

      if (response.ok) {
        setStatus('✅ SUCCESS!');
        addLog('✅ Upload successful!');
        addLog('🖼️ Image URL: ' + data.data?.image?.url);
      } else {
        setStatus('❌ FAILED');
        addLog('❌ Upload failed: ' + data.message);
      }
    } catch (error) {
      addLog('💥 Error: ' + error.message);
      setStatus('❌ ERROR: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Upload Test Page</h1>
      
      <div className="mb-6">
        <label className="block mb-2 text-lg font-semibold">
          Select an image to test upload:
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={testUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {status && (
        <div className={`p-4 rounded mb-4 text-lg font-bold ${
          status.includes('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {status}
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Logs:</h2>
        <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">Select a file to start test...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap">{log}</div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">Checklist:</h3>
        <ul className="space-y-1 text-sm">
          <li>✓ Backend running on port 5000</li>
          <li>✓ Logged in as admin</li>
          <li>✓ Cloudinary credentials in .env</li>
          <li>✓ File size under 5MB</li>
          <li>✓ File is an image type</li>
        </ul>
      </div>
    </div>
  );
}

