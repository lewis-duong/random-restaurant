"use client";
import { ExpandLess } from "@mui/icons-material";
import {
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  styled,
  Switch,
} from "@mui/material";

const AdvancedFeature = ({
  typeOflocation,
  handleChange,
  isSpinning,
  setIsAdvanced,
  isAdvanced,
  getLocation,
  listOfTypeslocations,
}) => {
  // console.log("loading", listOfTypeslocations);
  return (
    <div className="flex min-w-[300px] items-center">
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="demo-simple-select-label">Type</InputLabel>

        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={typeOflocation}
          label="Type location"
          onChange={handleChange}
          disabled={isSpinning}
        >
          {listOfTypeslocations?.map((item, index) => {
            return (
              <MenuItem key={index} value={item}>
                {item}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormControlLabel
        sx={{
          fontWeight: "bold",
        }}
        value="nearby"
        control={<Switch color="primary" />}
        label="Nearby"
        labelPlacement="top"
        onChange={getLocation}
      />
      <IconButton
        color="primary"
        onClick={() => setIsAdvanced(!isAdvanced)}
        aria-label="toggle advanced options"
      >
        <ExpandLess />
      </IconButton>
    </div>
  );
};
export default AdvancedFeature;
