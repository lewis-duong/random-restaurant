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
} from "@mui/material";

const initialRestaurants = [];
const listOfTypesRestaurants = [
  "Fast Food Restaurants",
  "Casual Dining Restaurants",
  "Fine Dining Restaurants",
  "Cafes",
  "Bistros",
  "Pizzerias",
  "Steakhouses",
  "Buffet Restaurants",
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
  "Ethnic Restaurants (e.g., Italian, Mexican, Indian)",
  "Farm-to-Table Restaurants",
  "Fusion Restaurants",
  "Pop-up Restaurants",
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

export default function RandomWheel() {
  const canvasRef = useRef(null);
  const [restaurants, setRestaurants] = useState([]);
  const [chosenRestaurant, setChosenRestaurant] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [linkId, setLinkId] = useState(null);
  const API_KEY = "xYMZRYtUiOGz90R5Lt3z7uAAJWaZb22L3hv4SKWs";
  const [listSuggestLocation, setListSuggestLocation] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [typeOfRestaurant, setTypeOfRestaurant] = useState("");
  const [location, setLocation] = useState("");
  const handleChange = (event) => {
    setTypeOfRestaurant(event.target.value);
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
    if (!restaurants?.length || restaurants?.length < 2) {
      alert("Please add more restaurants");
      return;
    }

    if (isSpinning) return;
    setIsSpinning(true);

    const canvas = canvasRef.current;
    const spins = 5 + Math.random() * 5;
    const arc = (Math.PI * 2) / restaurants?.length;
    const spinAngle = Math.random() * Math.PI * 2;
    const totalRotation = spins * Math.PI * 2 + spinAngle;

    canvas.style.transform = `rotate(${totalRotation - Math.PI / 2}rad)`;

    const finalAngle = totalRotation % (Math.PI * 2);
    const selectedIndex = Math.floor(
      (restaurants?.length - finalAngle / arc) % restaurants?.length
    );

    setTimeout(async () => {
      const selectedRestaurant = restaurants[selectedIndex];
      setChosenRestaurant(selectedRestaurant);
      setShowResult(true);
      setIsSpinning(false);
      setTimeout(() => setShowResult(false), 3000);

      // Save spin result to Firebase
      if (linkId) {
        await createSpinHistory(linkId, selectedRestaurant);
      }
    }, 5000);
  };

  const addRestaurant = (value) => async () => {
    let currentLinkId = linkId;

    try {
      if (!currentLinkId) {
        currentLinkId = await createEntity("linkIds", {
          createdAt: new Date().toISOString(),
        });
        setLinkId(currentLinkId);
        window.history.pushState({}, "", `?linkId=${currentLinkId}`);
      }

      const updatedRestaurants = [...restaurants, value];
      setRestaurants(updatedRestaurants);

      await createEntity(`restaurants/${currentLinkId}`, { name: value });
      console.log("Restaurant saved under linkId:", currentLinkId);
    } catch (error) {
      console.error("Error adding restaurant:", error);
    }
  };

  const deleteRestaurant = async (index) => {
    setIsDeleting(true);
    const restaurantToDelete = restaurants[index];
    const updatedRestaurants = restaurants.filter((_, i) => i !== index);
    setRestaurants(updatedRestaurants);

    try {
      if (linkId) {
        const restaurantData = await getEntity(`restaurants/${linkId}`);
        if (restaurantData) {
          const restaurantKey = Object.keys(restaurantData).find(
            (key) => restaurantData[key].name === restaurantToDelete
          );
          if (restaurantKey) {
            await deleteEntity(`restaurants/${linkId}`, restaurantKey);
            console.log(
              "Restaurant deleted from Firebase:",
              restaurantToDelete
            );
          }
        }
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchSuggesstLocation = async (keyword) => {
    // const newKeyword = (keyword + " " + typeOfRestaurant).replace(/ /g, "+");
    // console.log("🚀 ~ fetchSuggesstLocation ~ newKeyword:", newKeyword);
    let newKeyword;
    if (typeOfRestaurant && keyword === "") {
      newKeyword = typeOfRestaurant;
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
    fetchSuggesstLocation(keyword);
  }, [location, typeOfRestaurant]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentLinkId = urlParams.get("linkId");
    if (currentLinkId) {
      setLinkId(currentLinkId);
      const fetchRestaurants = async () => {
        setIsLoading(true);
        try {
          const restaurantData = await getEntity(
            `restaurants/${currentLinkId}`
          );
          if (restaurantData) {
            const restaurantList = Object.values(restaurantData).map(
              (item) => item.name
            );
            setRestaurants(restaurantList);
          }
        } catch (error) {
          console.error("Error fetching restaurants:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRestaurants();

      const unsubscribe = onEntityChange(
        `restaurants/${currentLinkId}`,
        (snapshot) => {
          const restaurantData = snapshot.val();
          if (restaurantData) {
            const restaurantList = Object.values(restaurantData).map(
              (item) => item.name
            );
            setRestaurants(restaurantList);
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
      const totalRestaurants = restaurants?.length;
      if (totalRestaurants === 0) return;
      const arc = (Math.PI * 2) / totalRestaurants;
      for (let i = 0; i < totalRestaurants; i++) {
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
        const truncatedText = truncateText(restaurants[i], maxTextWidth);

        ctx.strokeText(truncatedText, radius - 10, 5);
        ctx.fillText(truncatedText, radius - 10, 5);
        ctx.restore();
      }
    }
  }, [restaurants]);
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
      className={`${styles.body} items-center justify-between flex-col lg:flex-row relative md:p-28`}
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
            color: "white",
            marginBottom: 5,
          }}
        >
          Random restaurants wheel
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
      <div className="mt-4">
        <div className=" flex-1 px-2">
          <div className="flex min-w-[300px] items-center">
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="demo-simple-select-label">
                Type Restaurant
              </InputLabel>

              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={typeOfRestaurant}
                label="Type Restaurant"
                onChange={handleChange}
              >
                {listOfTypesRestaurants?.map((item, index) => {
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
          </div>

          <div className="min-w-[300px] ">
            <div className=" ">
              <TextField
                placeholder="Search restaurant..."
                onChange={(e) => {
                  setKeyword(e.target.value);
                  debounce(() => {
                    fetchSuggesstLocation(e.target.value);
                  }, 1000)();
                }}
                fullWidth
              />

              {listSuggestLocation?.length > 0 && (
                <List ref={listRef}>
                  {listSuggestLocation.map((item, idx) => (
                    <ListItem
                      button
                      key={idx}
                      onClick={addRestaurant(
                        item?.structured_formatting?.main_text
                      )}
                    >
                      <ListItemText primary={item.description} />
                    </ListItem>
                  ))}
                </List>
              )}
              {isLoading && <div>Loading suggestions...</div>}
              {/* {!isLoading &&
                listSuggestLocation?.length > 0 &&
                keyword.length > 0 && (
                  <div className="">
                    {listSuggestLocation.map((item, idx) => (
                      <p
                        key={idx}
                        onClick={addRestaurant(
                          item?.structured_formatting?.main_text
                        )}
                      >
                        {item.description}
                      </p>
                    ))}
                  </div>
                )} */}
              {/* {linkId && <SpinHistory linkId={linkId} />} */}

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
                  <Tabs value={activeTab} onChange={handleTabChange} centered>
                    <Tab label="List restaurent" />
                    <Tab label="History" />
                  </Tabs>
                  {activeTab === 0 && (
                    <div>
                      {isLoading && (
                        <div className="text-center">
                          Loading restaurants...
                        </div>
                      )}
                      {!isLoading && restaurants.length > 0 && (
                        <div className="bg-white">
                          <p className="text-lg font-semibold border-b border-[#ccc] p-4">
                            List restaurants
                          </p>
                          <div className="grid max-h-[50vh] overflow-auto">
                            {restaurants.map((name, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between gap-6 p-4 border-b"
                              >
                                <p className="text-sm text-gray-900">{name}</p>

                                <button
                                  className="px-4 py-2 text-white bg-red-400 rounded-md"
                                  onClick={() => deleteRestaurant(index)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
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
              className={`${styles.resultMessage} ${
                showResult ? styles.show : ""
              }`}
              role="alert"
              aria-live="polite"
            >
              <h1>
                <span className={styles.resultText}>Let's have</span>
                <br />
                <span className={styles.restaurantName}>
                  {chosenRestaurant}
                </span>
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
