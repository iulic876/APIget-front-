'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle, XCircle, Clock, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Request {
  id: number;
  name: string;
  method: string;
  url: string;
  body?: any;
}

interface Collection {
  id: number;
  name: string;
  requests: Request[];
}

interface RequestResult {
  id: number;
  name: string;
  method: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  response?: {
    status: number;
    statusText: string;
    data?: any;
    headers?: any;
  };
  error?: string;
  duration?: number;
}

interface CollectionRunnerProps {
  collection: Collection;
}

export const CollectionRunner = ({ collection }: CollectionRunnerProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<RequestResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [executionMode, setExecutionMode] = useState<'sequential' | 'parallel'>('sequential');
  const [delayBetweenRequests, setDelayBetweenRequests] = useState(1000);

  // Initialize results when collection changes
  useEffect(() => {
    const initialResults: RequestResult[] = collection.requests.map(request => ({
      id: request.id,
      name: request.name,
      method: request.method,
      url: request.url,
      status: 'pending'
    }));
    setResults(initialResults);
    setCurrentIndex(0);
    setProgress(0);
  }, [collection]);

  // Mock API call
  const mockApiCall = async (request: Request): Promise<RequestResult> => {
    const startTime = Date.now();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    const duration = Date.now() - startTime;
    
    // Simulate success/failure
    const isSuccess = Math.random() > 0.2; // 80% success rate
    
    if (isSuccess) {
      return {
        id: request.id,
        name: request.name,
        method: request.method,
        url: request.url,
        status: 'completed',
        duration,
        response: {
          status: 200,
          statusText: 'OK',
          data: { message: 'Success', timestamp: new Date().toISOString() },
          headers: { 'content-type': 'application/json' }
        }
      };
    } else {
      return {
        id: request.id,
        name: request.name,
        method: request.method,
        url: request.url,
        status: 'failed',
        duration,
        error: 'Request failed - Network error'
      };
    }
  };

  const runSequential = async () => {
    setIsRunning(true);
    setIsPaused(false);
    
    for (let i = 0; i < collection.requests.length; i++) {
      if (!isRunning) break;
      
      if (isPaused) {
        await new Promise(resolve => {
          const checkPause = () => {
            if (!isPaused) resolve(true);
            else setTimeout(checkPause, 100);
          };
          checkPause();
        });
      }
      
      setCurrentIndex(i);
      const request = collection.requests[i];
      
      // Update status to running
      setResults(prev => prev.map(r => 
        r.id === request.id ? { ...r, status: 'running' } : r
      ));
      
      // Execute request
      const result = await mockApiCall(request);
      
      // Update results
      setResults(prev => prev.map(r => 
        r.id === result.id ? result : r
      ));
      
      // Update progress
      const newProgress = ((i + 1) / collection.requests.length) * 100;
      setProgress(newProgress);
      
      // Delay between requests
      if (i < collection.requests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
      }
    }
    
    setIsRunning(false);
    setIsPaused(false);
  };

  const runParallel = async () => {
    setIsRunning(true);
    setIsPaused(false);
    
    // Mark all as running
    setResults(prev => prev.map(r => ({ ...r, status: 'running' })));
    
    // Execute all requests in parallel
    const promises = collection.requests.map(async (request, index) => {
      const result = await mockApiCall(request);
      return { result, index };
    });
    
    const resultsWithIndex = await Promise.all(promises);
    
    // Update results in order
    resultsWithIndex.forEach(({ result, index }) => {
      setResults(prev => prev.map(r => 
        r.id === result.id ? result : r
      ));
      setProgress(((index + 1) / collection.requests.length) * 100);
    });
    
    setIsRunning(false);
    setIsPaused(false);
  };

  const startExecution = () => {
    if (executionMode === 'sequential') {
      runSequential();
    } else {
      runParallel();
    }
  };

  const pauseExecution = () => {
    setIsPaused(true);
  };

  const resumeExecution = () => {
    setIsPaused(false);
  };

  const stopExecution = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const resetExecution = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setProgress(0);
    setResults(prev => prev.map(r => ({ ...r, status: 'pending' })));
  };

  const getStatusIcon = (status: RequestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: RequestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400';
      case 'running':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
    }
  };

  const completedCount = results.filter(r => r.status === 'completed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const totalCount = collection.requests.length;

  return (
    <div className="h-full flex flex-col bg-[#1a1b20] text-white">
      {/* Header */}
      <div className="border-b border-[#2e2f3e] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Collection Runner</h1>
            <p className="text-gray-400 text-sm">{collection.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="border-[#2e2f3e] hover:bg-[#2e2f3e] text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="default"
              size="sm"
              className="border-[#2e2f3e] hover:bg-[#2e2f3e] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-[#2e2f3e] p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button
                onClick={startExecution}
                className="bg-green-600 hover:bg-green-700"
                disabled={results.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Run Collection
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button
                    onClick={resumeExecution}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    onClick={pauseExecution}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={stopExecution}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            )}
            <Button
              onClick={resetExecution}
              variant="default"
              className="border-[#2e2f3e] hover:bg-[#2e2f3e] text-white"
            >
              Reset
            </Button>
          </div>

          <div className="flex items-center gap-4 ml-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Mode:</span>
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value as 'sequential' | 'parallel')}
                className="bg-[#2e2f3e] border border-[#474855] rounded px-2 py-1 text-sm"
                disabled={isRunning}
              >
                <option value="sequential">Sequential</option>
                <option value="parallel">Parallel</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Delay:</span>
              <input
                type="number"
                value={delayBetweenRequests}
                onChange={(e) => setDelayBetweenRequests(Number(e.target.value))}
                className="bg-[#2e2f3e] border border-[#474855] rounded px-2 py-1 text-sm w-20"
                disabled={isRunning}
                min="0"
                step="100"
              />
              <span className="text-sm text-gray-400">ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-[#2e2f3e] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-400">
            {completedCount} completed, {failedCount} failed, {totalCount} total
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
          <span>Current: {isRunning ? collection.requests[currentIndex]?.name : 'None'}</span>
          <span>Duration: {results.reduce((acc, r) => acc + (r.duration || 0), 0)}ms</span>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-lg font-semibold mb-4">Request Results</h3>
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className={`p-4 rounded-lg border ${
                result.status === 'completed' 
                  ? 'border-green-600 bg-green-900/20' 
                  : result.status === 'failed'
                  ? 'border-red-600 bg-red-900/20'
                  : result.status === 'running'
                  ? 'border-blue-600 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-900/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded font-mono ${
                          result.method === 'GET' ? 'bg-green-600' :
                          result.method === 'POST' ? 'bg-blue-600' :
                          result.method === 'PUT' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }`}
                      >
                        {result.method}
                      </span>
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{result.url}</div>
                  </div>
                </div>
                <div className="text-right">
                  {result.duration && (
                    <div className="text-sm text-gray-400">{result.duration}ms</div>
                  )}
                  {result.response && (
                    <div className={`text-sm ${result.response.status < 400 ? 'text-green-400' : 'text-red-400'}`}>
                      {result.response.status} {result.response.statusText}
                    </div>
                  )}
                  {result.error && (
                    <div className="text-sm text-red-400">{result.error}</div>
                  )}
                </div>
              </div>
              
              {/* Response details (expandable) */}
              {result.response && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-400 hover:text-white">
                      View Response Details
                    </summary>
                    <div className="mt-2 p-3 bg-[#2e2f3e] rounded">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(result.response.data, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 