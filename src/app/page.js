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
  deleteAllEntities,
} from "@/firebase/databaseApi";
import SpinHistory from "@/components/SpinHistory";
import { LinkIcon, ShareIcon } from "lucide-react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import WheelCanvas from "@/components/WheelCanvas";
import AdvancedFeature from "@/components/AdvancedFeature";
import NormalFeature from "@/components/NormalFeature";
import ListSuggestions from "@/components/ListSuggestion";
import LocationList from "@/components/LocationList";
import ResultModal from "@/components/ResultModal";

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
  const [spinHistory, setSpinHistory] = useState([]);

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

  const spinWheel = () => {
    if (!locations?.length || locations?.length < 2) {
      alert("Please add more locations");
      return;
    }

    if (isSpinning) return;
    setIsSpinning(true);

    const canvas = canvasRef.current;
    const spins = 5 + Math.random() * 20;
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

  const deleteAllLocations = async () => {
    setIsDeleting(true);
    try {
      if (linkId) {
        await deleteAllEntities(`locations/${linkId}`);
        setlocations([]);
        console.log("All locations deleted from Firebase");
      }
    } catch (error) {
      console.error("Error deleting all locations:", error);
    } finally {
      setIsDeleting(false);
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
        setChosenlocation(sortedHistory[0].result);
        setShowResult(true);
        setTimeout(() => {
          setShowResult(false);
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, [linkId]);

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
          <WheelCanvas locations={locations} canvasRef={canvasRef} />
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
              <AdvancedFeature
                typeOflocation={typeOflocation}
                handleChange={handleChange}
                isSpinning={isSpinning}
                listOfTypeslocations={listOfTypeslocations}
                setIsAdvanced={setIsAdvanced}
                isAdvanced={isAdvanced}
                getLocation={getLocation}
              />
            )}
            {!isAdvanced && (
              <NormalFeature
                addMultipleLocation={addMultipleLocation}
                handleChangeLocations={handleChangeLocations}
                isAdvanced={isAdvanced}
                setIsAdvanced={setIsAdvanced}
                locationInputs={locationInputs}
                isSpinning={isSpinning}
                key={"normal-feature"}
              />
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
                <ListSuggestions
                  addlocation={addlocation}
                  listRef={listRef}
                  listSuggestLocation={listSuggestLocation}
                />
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
                    <LocationList
                      deletelocation={deletelocation}
                      isDeleting={isDeleting}
                      isSpinning={isSpinning}
                      isLoading={isLoading}
                      locations={locations}
                      deleteAllLocations={deleteAllLocations}
                    />
                  )}
                  {activeTab === 1 && (
                    <div>
                      <SpinHistory spinHistory={spinHistory} />
                    </div>
                  )}
                </Box>
              )}
            </div>
            <ResultModal
              styles={styles}
              chosenlocation={chosenlocation}
              showResult={showResult}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
