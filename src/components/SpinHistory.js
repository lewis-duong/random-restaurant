"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@mui/material";

const SpinHistory = ({ spinHistory }) => {
  return (
    <>
      <Card className="w-full max-w-md mx-auto  h-[200px] overflow-auto">
        <CardHeader>
          <CardTitle>Spin History</CardTitle>
        </CardHeader>
        <CardContent className="">
          {spinHistory.length === 0 ? (
            <p className="text-center text-gray-500">
              No spin history available
            </p>
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
    </>
  );
};

export default SpinHistory;
