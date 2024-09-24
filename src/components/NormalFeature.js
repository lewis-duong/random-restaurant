"use client";

import { ExpandMore } from "@mui/icons-material";
import { Button, IconButton, MenuItem, Select, TextField } from "@mui/material";

const NormalFeature = ({
  locationInputs,
  handleChangeLocations,
  addMultipleLocation,
  setIsAdvanced,
  isAdvanced,
  isSpinning,
}) => {
  return (
    <div className="flex items-center justify-center  mb-4 top-2 right-2">
      <TextField
        label="Add Location"
        variant="outlined"
        size="small"
        value={locationInputs.join("\n")}
        onChange={handleChangeLocations}
        className="mr-2 flex-1"
        multiline
        rows={4}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => addMultipleLocation(locationInputs)}
        className="h-10 mx-2"
        disabled={isSpinning}
      >
        Add
      </Button>

      <IconButton
        color="primary"
        onClick={() => setIsAdvanced(!isAdvanced)}
        aria-label="toggle advanced options"
      >
        <ExpandMore />
      </IconButton>
    </div>
  );
};
export default NormalFeature;
