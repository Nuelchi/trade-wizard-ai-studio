import React from 'react';

const PerformanceTab = ({ metrics }: { metrics: any }) => (
  <div>
    <h3 className="text-lg font-semibold mb-2">Performance</h3>
    <pre className="bg-muted/20 rounded p-3 text-xs overflow-auto">{JSON.stringify(metrics, null, 2)}</pre>
  </div>
);

export default PerformanceTab; 