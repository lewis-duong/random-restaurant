"use client";
import React, { useState, useEffect } from "react";
import { getEntity, onEntityChange } from "@/firebase/databaseApi";
import { Card, CardContent, CardHeader, CardTitle } from "@mui/material";

const SpinHistory = ({ linkId }) => {
  const [spinHistory, setSpinHistory] = useState([]);

  useEffect(() => {
    const fetchSpinHistory = async () => {
      if (linkId) {
        const history = await getEntity(`spins/${linkId}`);
        if (history) {
          const sortedHistory = Object.entries(history)
            .map(([key, value]) => ({ id: key, ...value }))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setSpinHistory(sortedHistory);
        }
      }
    };

    fetchSpinHistory();

    const unsubscribe = onEntityChange(`spins/${linkId}`, (snapshot) => {
      const history = snapshot.val();
      if (history) {
        const sortedHistory = Object.entries(history)
          .map(([key, value]) => ({ id: key, ...value }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setSpinHistory(sortedHistory);
      }
    });

    return () => unsubscribe();
  }, [linkId]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Spin History</CardTitle>
      </CardHeader>
      <CardContent>
        {spinHistory.length === 0 ? (
          <p className="text-center text-gray-500">No spin history available</p>
        ) : (
          <div className="  space-y-2">
            {spinHistory.map((spin) => (
              <div key={spin.id} className="grid grid-cols-1 border-b pb-2">
                <span className="font-medium">{spin.result}</span>
                <span className="text-sm text-gray-500 ">
                  {new Date(spin.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpinHistory;
