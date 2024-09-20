"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./randomwheel.module.css";
import axios from "axios";
import {
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  List,
  ListItem,
  ListItemText,
  Box,
  Tabs,
  Tab,
  Button,
  IconButton,
  Typography,
  Paper,
  Grid,
} from "@mui/material";

const initiallocations = ["Example 1", "Example 2", "Example 3"];
const listOfTypeslocations = [
  "Fast Food locations",
  "Casual Dining locations",
  "Fine Dining locations",
  "Cafes",
  "Bistros",
  "Pizzerias",
  "Steakhouses",
  "Buffet locations",
  "Food Trucks",
  "Gastropubs",
  "Brasseries",
  "Diners",
  "Sushi Bars",
  "Taco Stands",
  "Ice Cream Parlors",
  "Barbecue Joints",
  "Delis (Delicatessens)",
  "Tea Houses",
  "Patisseries",
  "Wine Bars",
  "Ethnic locations (e.g., Italian, Mexican, Indian)",
  "Farm-to-Table locations",
  "Fusion locations",
  "Pop-up locations",
  "Bakeries",
];
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  createEntity,
  deleteEntity,
  getEntity,
  onEntityChange,
  createSpinHistory,
} from "@/firebase/databaseApi";
import SpinHistory from "@/components/SpinHistory";
import { LinkIcon, ShareIcon } from "lucide-react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

export default function RandomWheel() {
  const canvasRef = useRef(null);
  const [locations, setlocations] = useState([]);
  const [chosenlocation, setChosenlocation] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [linkId, setLinkId] = useState(null);
  const API_KEY = "xYMZRYtUiOGz90R5Lt3z7uAAJWaZb22L3hv4SKWs";
  const [listSuggestLocation, setListSuggestLocation] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [typeOflocation, setTypeOflocation] = useState("");
  const [location, setLocation] = useState("");
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [locationInputs, setLocationInputs] = useState([]);
  const handleChangeLocations = (e) => {
    const value = e.target.value;
    const lines = value.split("\n");
    setLocationInputs(lines);
  };
  const handleChange = (event) => {
    setTypeOflocation(event.target.value);
  };
  const listRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const debounce = (func, wait) => {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  function randomHexColor() {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  }

  const spinWheel = () => {
    if (!locations?.length || locations?.length < 2) {
      alert("Please add more locations");
      return;
    }

    if (isSpinning) return;
    setIsSpinning(true);

    const canvas = canvasRef.current;
    const spins = 5 + Math.random() * 5;
    const arc = (Math.PI * 2) / locations?.length;
    const spinAngle = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + spinAngle;

    canvas.style.transform = `rotate(${totalRotation - Math.PI / 2}rad)`;

    const finalAngle = totalRotation % (Math.PI * 2);
    const selectedIndex = Math.floor(
      (locations?.length - finalAngle / arc) % locations?.length
    );

    setTimeout(async () => {
      const selectedlocation = locations[selectedIndex];
      setChosenlocation(selectedlocation);
      setShowResult(true);
      setIsSpinning(false);
      setTimeout(() => setShowResult(false), 3000);

      // Save spin result to Firebase
      if (linkId) {
        await createSpinHistory(linkId, selectedlocation);
      }
    }, 5000);
  };

  const addlocation = async (value) => {
    debugger;
    let currentLinkId = linkId;
    try {
      if (!currentLinkId) {
        currentLinkId = await createEntity("linkIds", {
          createdAt: new Date().toISOString(),
        });
        setLinkId(currentLinkId);
        window.history.pushState({}, "", `?linkId=${currentLinkId}`);
      }

      const updatedlocations = [...locations, value];
      setlocations(updatedlocations);

      await createEntity(`locations/${currentLinkId}`, { name: value });
      console.log("location saved under linkId:", currentLinkId);
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };
  const addMultipleLocation = async (values) => {
    let currentLinkId = linkId;
    try {
      if (!currentLinkId) {
        currentLinkId = await createEntity("linkIds", {
          createdAt: new Date().toISOString(),
        });
        setLinkId(currentLinkId);
        window.history.pushState({}, "", `?linkId=${currentLinkId}`);
      }

      const updatedLocations = [...locations, ...values];
      setlocations(updatedLocations);

      for (const value of values) {
        await createEntity(`locations/${currentLinkId}`, { name: value });
        console.log("Location saved under linkId:", currentLinkId);
      }
    } catch (error) {
      console.error("Error adding locations:", error);
    }
  };
  const deletelocation = async (index) => {
    setIsDeleting(true);
    const locationToDelete = locations[index];
    const updatedlocations = locations.filter((_, i) => i !== index);
    setlocations(updatedlocations);

    try {
      if (linkId) {
        const locationData = await getEntity(`locations/${linkId}`);
        if (locationData) {
          const locationKey = Object.keys(locationData).find(
            (key) => locationData[key].name === locationToDelete
          );
          if (locationKey) {
            await deleteEntity(`locations/${linkId}`, locationKey);
            console.log("location deleted from Firebase:", locationToDelete);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting location:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchSuggesstLocation = async (keyword) => {
    // const newKeyword = (keyword + " " + typeOflocation).replace(/ /g, "+");
    // console.log("🚀 ~ fetchSuggesstLocation ~ newKeyword:", newKeyword);
    let newKeyword;
    if (typeOflocation && keyword === "") {
      newKeyword = typeOflocation;
    } else {
      newKeyword = keyword;
    }
    let url = "";
    if (!location) {
      url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${API_KEY}&input=${newKeyword}`;
    } else {
      url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${API_KEY}&input=${newKeyword}&location=${location}`;
    }
    const data = await axios.get(url);
    if (data.status === 200) {
      setListSuggestLocation(data.data.predictions);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const locationString = `${latitude},${longitude}`;
        console.log(locationString); // You can use this string as needed
        setLocation(locationString);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };
  useEffect(() => {
    setLocationInputs(initiallocations);
    fetchSuggesstLocation(keyword);
  }, [location, typeOflocation]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentLinkId = urlParams.get("linkId");
    if (currentLinkId) {
      setLinkId(currentLinkId);
      const fetchlocations = async () => {
        setIsLoading(true);
        try {
          const locationData = await getEntity(`locations/${currentLinkId}`);
          if (locationData) {
            const locationList = Object.values(locationData).map(
              (item) => item.name
            );
            setlocations(locationList);
          }
        } catch (error) {
          console.error("Error fetching locations:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchlocations();

      const unsubscribe = onEntityChange(
        `locations/${currentLinkId}`,
        (snapshot) => {
          const locationData = snapshot.val();
          if (locationData) {
            const locationList = Object.values(locationData).map(
              (item) => item.name
            );
            setlocations(locationList);
          }
        }
      );

      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    resizeCanvas();
    drawWheel();

    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);

    function resizeCanvas() {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      drawWheel();
    }
    function truncateText(text, maxWidth) {
      let truncated = text;
      while (ctx.measureText(truncated).width > maxWidth) {
        truncated = truncated.slice(0, -1);
      }
      return truncated.length < text.length ? truncated + "..." : truncated;
    }

    function drawWheel() {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.max(Math.min(centerX, centerY) - 10, 0);
      const totallocations = locations?.length;
      if (totallocations === 0) return;
      const arc = (Math.PI * 2) / totallocations;
      for (let i = 0; i < totallocations; i++) {
        const angle = i * arc;
        ctx.beginPath();
        ctx.fillStyle = randomHexColor();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#333";
        ctx.font = "bold 12px Arial";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        const maxTextWidth = radius * 0.7;
        const truncatedText = truncateText(locations[i], maxTextWidth);

        ctx.strokeText(truncatedText, radius - 10, 5);
        ctx.fillText(truncatedText, radius - 10, 5);
        ctx.restore();
      }
    }
  }, [locations]);
  const handleClickOutside = (event) => {
    if (listRef.current && !listRef.current.contains(event.target)) {
      setListSuggestLocation([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("URL copied to clipboard!");
    });
  };
  return (
    <div
      className={`${styles.body} items-center justify-between flex-col lg:flex-row relative p-4 md:p-16 xl:p-28 max-w-[1280px] mx-auto`}
    >
      <div className="flex  md:items-stretch mb-4 absolute top-2 right-2">
        <IconButton
          color="primary"
          onClick={copyToClipboard}
          aria-label="share"
        >
          <LinkIcon />
        </IconButton>
      </div>
      <div>
        <Typography
          variant="h4"
          sx={{
            marginBottom: 5,
            textAlign: "center",
          }}
        >
          Random wheel
        </Typography>
        <div className={`${styles.wheelContainer} `}>
          <div className={styles.selector}></div>
          <canvas ref={canvasRef} className={styles.wheel}></canvas>
          <button
            className={styles.wheelCenter}
            onClick={spinWheel}
            disabled={isSpinning}
            aria-label="Spin the wheel"
          >
            {isSpinning ? "Spinning..." : "SPIN"}
          </button>
        </div>
      </div>
      <div className="mt-4 w-[343px] md:w-[400px]">
        <div className=" flex-1 px-2">
          <div className="min-w-[300px] ">
            {isAdvanced && (
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
            )}
            {!isAdvanced && (
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
                  className="h-10"
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
            )}
            <div className=" relative">
              {isAdvanced && (
                <TextField
                  placeholder="Search location..."
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    debounce(() => {
                      fetchSuggesstLocation(e.target.value);
                    }, 2000)();
                  }}
                  fullWidth
                  disabled={isSpinning}
                />
              )}

              {listSuggestLocation?.length > 0 && (
                <List
                  ref={listRef}
                  className="absolute left-0 top-[60px] bg-white z-50 border border-gray-200 shadow-md"
                >
                  {listSuggestLocation.map((item, idx) => (
                    <ListItem
                      button
                      key={idx}
                      onClick={() =>
                        addlocation(item?.structured_formatting?.main_text)
                      }
                    >
                      <ListItemText primary={item.description} />
                    </ListItem>
                  ))}
                </List>
              )}

              {linkId && (
                <Box
                  sx={{
                    width: "100%",
                    bgcolor: "background.paper",
                    marginTop: 2,
                    borderRadius: 2,
                    maxWidth: 520,
                  }}
                >
                  {locations && locations.length > 0 && (
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                      <Tab label="Random list" />
                      <Tab label="History" />
                    </Tabs>
                  )}
                  {activeTab === 0 && (
                    <div className="h-[200px] overflow-auto">
                      {!isLoading && locations.length > 0 && (
                        <Paper elevation={3} className=" bg-white shadow-none">
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
                                >
                                  Delete
                                </Button>
                              </Grid>
                            ))}
                          </Box>
                        </Paper>
                      )}
                    </div>
                  )}
                  {activeTab === 1 && (
                    <div>
                      <SpinHistory linkId={linkId} />
                    </div>
                  )}
                </Box>
              )}
            </div>

            <div
              className={` ${styles.resultMessage} ${
                showResult ? styles.show : ""
              }`}
              role="alert"
              aria-live="polite"
            >
              <h1>
                <span className={styles.resultText}>Let's have</span>
                <br />
                <span className={styles.locationName}>{chosenlocation}</span>
                <br />
                <span className={styles.resultText}>tonight!</span>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
