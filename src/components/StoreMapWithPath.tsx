"use client";

import React, { useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import type { Node } from "@/lib/types";

interface StoreMapWithPathProps {
  pathNodes: Node[];
  mapImagePath: string;
}

export default function StoreMapWithPath({
  pathNodes,
  mapImagePath,
}: StoreMapWithPathProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [currentStep, setCurrentStep] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  // Convert percentage coordinates to actual pixels
  const getNodePosition = (node: Node) => {
    if (!node.x || !node.y || imageSize.width === 0 || imageSize.height === 0) {
      return { x: 0, y: 0 };
    }
    return {
      x: (imageSize.width * node.x) / 100,
      y: (imageSize.height * node.y) / 100,
    };
  };

  // Navigation functions
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(pathNodes.length - 1, prev + 1));
  };

  // Generate path string for completed steps including current node (green line)
  const getCompletedPathString = () => {
    if (currentStep < 1) return "";
    return pathNodes
      .slice(0, currentStep + 1)
      .map((node) => {
        const pos = getNodePosition(node);
        return `${pos.x},${pos.y}`;
      })
      .join(" ");
  };

  // Generate path string for future steps (black line)
  const getFuturePathString = () => {
    if (currentStep >= pathNodes.length - 1) return "";
    return pathNodes
      .slice(currentStep)
      .map((node) => {
        const pos = getNodePosition(node);
        return `${pos.x},${pos.y}`;
      })
      .join(" ");
  };

 

  // Group nodes by ID to get all step numbers for each unique node
  const getNodeSteps = () => {
    const nodeSteps: { [nodeId: string]: number[] } = {};
    pathNodes.forEach((node, index) => {
      if (!nodeSteps[node.id]) {
        nodeSteps[node.id] = [];
      }
      nodeSteps[node.id].push(index + 1); // Convert to 1-based step numbers
    });
    return nodeSteps;
  };

  // Get unique nodes (first occurrence of each node ID)
  const getUniqueNodes = () => {
    const seen = new Set<string>();
    return pathNodes.filter((node) => {
      if (seen.has(node.id)) {
        return false;
      }
      seen.add(node.id);
      return true;
    });
  };

  return (
    <div className="w-full h-[500px] border rounded-lg overflow-hidden relative">
      {/* Navigation Buttons */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          ← Previous
        </Button>
      </div>
      
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentStep === pathNodes.length - 1}
          className="flex items-center gap-2"
        >
          Next →
        </Button>
      </div>

      {/* Use react-zoom-pan-pinch to allow zooming and panning of the image */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: true }}
        panning={{ disabled: false }}
      >
        <>
          <TransformComponent>
            <div className="relative">
              {/* Store Map Image */}
              <img
                ref={imageRef}
                src={mapImagePath}
                alt="Store layout map"
                className="block max-w-none"
                onLoad={() => {
                  if (imageRef.current) {
                    setImageSize({
                      width: imageRef.current.naturalWidth,
                      height: imageRef.current.naturalHeight,
                    });
                  }
                }}
              />

              {/* overlay image with svg, showing the path using the path nodes positions */}
              <svg
                className="absolute top-0 left-0"
                width={imageSize.width}
                height={imageSize.height}
                style={{ pointerEvents: "none" }}
              >
                {/* The completed path line including current node (green) */}
                {currentStep >= 1 && (
                  <polyline
                    points={getCompletedPathString()}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* The future path line (black) */}
                {currentStep < pathNodes.length - 1 && (
                  <polyline
                    points={getFuturePathString()}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Nodes */}
                {(() => {
                  const nodeSteps = getNodeSteps();
                  const uniqueNodes = getUniqueNodes();

                  return uniqueNodes.map((node) => {
                    const pos = getNodePosition(node);
                    const steps = nodeSteps[node.id];
                    const stepText = steps.join("/");
                    
                     // Check if this node is the current step
                     const isCurrentNode = pathNodes[currentStep]?.id === node.id;
                     
                     // Check if this node has been completed
                     const isCompleted = steps.some(step => step - 1 < currentStep);
                     
                     // Check if this is the final node and we're at the end
                     const isFinalNode = currentStep === pathNodes.length - 1 && isCurrentNode;

                     return (
                       <g key={node.id}>
                         {/* Node Circle */}
                         <circle
                           cx={pos.x}
                           cy={pos.y}
                           r="16"
                           stroke={isFinalNode ? "#10b981" : isCurrentNode ? "#3b82f6" : isCompleted ? "#10b981" : "black"}
                           strokeWidth={isFinalNode || isCurrentNode ? "4" : "3"}
                           fill={isFinalNode ? "#10b981" : isCurrentNode ? "#3b82f6" : isCompleted ? "#10b981" : "black"}
                         />

                        {/* Numbers */}
                        <text
                          x={pos.x}
                          y={pos.y + 5} // Vertically centralise text
                          textAnchor="middle"
                          fill="white"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {stepText}
                        </text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </TransformComponent>
        </>
      </TransformWrapper>
    </div>
  );
}
