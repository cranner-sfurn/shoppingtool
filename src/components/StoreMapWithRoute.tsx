"use client";

import React, { useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { Node } from "@/lib/types";

interface StoreMapWithRouteProps {
  routeNodes: Node[];
  mapImagePath: string;
}

export default function StoreMapWithRoute({
  routeNodes,
  mapImagePath,
}: StoreMapWithRouteProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
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

  // Generate path string for SVG polyline (the line that joins the route nodes)
  const getPathString = () => {
    return routeNodes
      .map((node) => {
        const pos = getNodePosition(node);
        return `${pos.x},${pos.y}`;
      })
      .join(" ");
  };

  // Group nodes by ID to get all step numbers for each unique node
  const getNodeSteps = () => {
    const nodeSteps: { [nodeId: string]: number[] } = {};
    routeNodes.forEach((node, index) => {
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
    return routeNodes.filter((node) => {
      if (seen.has(node.id)) {
        return false;
      }
      seen.add(node.id);
      return true;
    });
  };

  return (
    <div className="w-full h-[500px] border rounded-lg overflow-hidden">
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

              {/* overlay image with svg, showing the route using the route nodes positions */}
              <svg
                className="absolute top-0 left-0"
                width={imageSize.width}
                height={imageSize.height}
                style={{ pointerEvents: "none" }}
              >
                {/* The line that joins the route nodes */}
                {routeNodes.length > 1 && (
                  <polyline
                    points={getPathString()}
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

                    return (
                      <g key={node.id}>
                        {/* Node Circle */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="16"
                          stroke="white"
                          strokeWidth="3"
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
