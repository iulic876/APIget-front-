"use client";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";

import { useCallback, useState } from "react";

export default function FlowBuilderPage() {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: "1",
      type: "default",
      position: { x: 50, y: 100 },
      data: { label: "🔸 Request" },
    },
    {
      id: "2",
      type: "default",
      position: { x: 300, y: 100 },
      data: { label: "🔧 Template" },
    },
    {
      id: "3",
      type: "default",
      position: { x: 550, y: 100 },
      data: { label: "📦 Response" },
    },
  ]);

  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  );

  return (
    <div className="h-screen w-full bg-[#0d1117]">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background color="#333" gap={24} />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
