'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, Square, CheckCircle, XCircle, Clock, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ApiService from '@/services/api';
import { toast } from 'sonner';

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
  const [runId, setRunId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setRunId(null);
  }, [collection]);

  // Real API call to execute collection
  const executeCollection = async () => {
    setIsLoading(true);
    
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        toast.error('User not found. Please log in again.');
        return;
      }

      const payload = {
        executionMode,
        delayBetweenRequests,
        environment: 'development', // Default for now
        variables: {}, // Empty for now, can be extended later
        userId: parseInt(userId)
      };

      console.log('Executing collection:', collection.id, 'with payload:', payload);

      const response = await ApiService.post(`/collections/${collection.id}/run`, payload);
      
      if (response.ok && response.data) {
        console.log('Collection run started:', response.data);
        setRunId(response.data.runId);
        
        // If the backend returns immediate results, update the UI
        if (response.data.results && Array.isArray(response.data.results)) {
          setResults(response.data.results);
          setProgress((response.data.results.length / collection.requests.length) * 100);
        }
        
        // If the run is already completed
        if (response.data.status === 'completed') {
          setIsRunning(false);
          setIsPaused(false);
          toast.success('Collection run completed!');
        } else {
          setIsRunning(true);
          setIsPaused(false);
          toast.success('Collection run started!');
        }
      } else if (response.status === 404) {
        // Backend endpoint not implemented yet, fall back to mock
        console.log('Backend endpoint not found, using mock execution');
        toast.info('Backend endpoint not implemented yet. Using mock execution.');
        startMockExecution();
      } else {
        console.error('Failed to start collection run:', response.error);
        toast.error(response.error || 'Failed to start collection run');
      }
    } catch (error) {
      console.error('Error executing collection:', error);
      toast.error('An error occurred while starting the collection run');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock execution fallback
  const startMockExecution = () => {
    setIsRunning(true);
    setIsPaused(false);
    setRunId('mock-run-' + Date.now());
    
    // Simulate sequential execution
    const executeSequentially = async () => {
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
        
        // Simulate API call
        const startTime = Date.now();
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
        const duration = Date.now() - startTime;
        
        // Simulate success/failure
        const isSuccess = Math.random() > 0.2;
        
        const result: RequestResult = {
          id: request.id,
          name: request.name,
          method: request.method,
          url: request.url,
          status: isSuccess ? 'completed' : 'failed',
          duration,
          ...(isSuccess ? {
            response: {
              status: 200,
              statusText: 'OK',
              data: { message: 'Success', timestamp: new Date().toISOString() },
              headers: { 'content-type': 'application/json' }
            }
          } : {
            error: 'Request failed - Network error'
          })
        };
        
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
      toast.success('Mock collection run completed!');
    };
    
    executeSequentially();
  };

  // Poll for updates if run is in progress
  useEffect(() => {
    if (!isRunning || !runId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await ApiService.get(`/collections/${collection.id}/runs/${runId}`);
        
        if (response.ok && response.data) {
          const runData = response.data;
          
          // Update results if available
          if (runData.results && Array.isArray(runData.results)) {
            setResults(runData.results);
            
            const completedCount = runData.results.filter((r: any) => r.status === 'completed').length;
            setProgress((completedCount / collection.requests.length) * 100);
          }
          
          // Check if run is completed
          if (runData.status === 'completed' || runData.status === 'failed') {
            setIsRunning(false);
            setIsPaused(false);
            clearInterval(pollInterval);
            
            if (runData.status === 'completed') {
              toast.success('Collection run completed!');
            } else {
              toast.error('Collection run failed!');
            }
          }
        }
      } catch (error) {
        console.error('Error polling run status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isRunning, runId, collection.id, collection.requests.length]);

  const startExecution = () => {
    if (isLoading) return;
    executeCollection();
  };

  const pauseExecution = () => {
    setIsPaused(true);
    toast.info('Execution paused');
  };

  const resumeExecution = () => {
    setIsPaused(false);
    toast.info('Execution resumed');
  };

  const stopExecution = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRunId(null);
    toast.info('Execution stopped');
  };

  const resetExecution = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentIndex(0);
    setProgress(0);
    setRunId(null);
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
            {runId && (
              <p className="text-xs text-gray-500 mt-1">Run ID: {runId}</p>
            )}
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
                disabled={results.length === 0 || isLoading}
              >
                <Play className="w-4 h-4 mr-2" />
                {isLoading ? 'Starting...' : 'Run Collection'}
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