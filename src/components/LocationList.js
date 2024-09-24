"use client";

import { Box, Button, Grid, Paper, Typography } from "@mui/material";

const LocationList = ({
  isLoading,
  locations,
  isDeleting,
  isSpinning,
  deletelocation,
  deleteAllLocations,
}) => {
  return (
    <div className="h-[200px] overflow-auto">
      {!isLoading && locations.length > 0 && (
        <Paper elevation={3} className=" bg-white shadow-none">
          <div className="flex justify-end my-2">
            <Button
              variant="outlined"
              disabled={isDeleting || isSpinning}
              onClick={deleteAllLocations}
              color="error"
              size="small"
            >
              Delete all
            </Button>
          </div>

          <Box className="grid  shadow-none border border-gray-200">
            {locations.map((name, index) => (
              <Grid
                container
                key={index}
                alignItems="center"
                justifyContent="space-between"
                className="gap-6 p-4 border-b"
              >
                <Typography variant="body2" color="textPrimary">
                  {name}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => deletelocation(index)}
                  disabled={isDeleting || isSpinning}
                  color="error"
                  size="small"
                >
                  Delete
                </Button>
              </Grid>
            ))}
          </Box>
        </Paper>
      )}
    </div>
  );
};
export default LocationList;
