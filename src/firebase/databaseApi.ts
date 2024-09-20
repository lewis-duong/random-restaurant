import {
  get,
  ref,
  remove,
  set,
  update,
  push,
  onValue,
} from "firebase/database";
import { database } from "./firebase";

export const createEntity = async (path, data) => {
  try {
    const entityRef = ref(database, path);
    const newEntityRef = push(entityRef); // Generate a new reference with a unique ID
    await set(newEntityRef, data);
    console.log("Entity created successfully with ID:", newEntityRef.key);
    return newEntityRef.key; // Return the generated ID
  } catch (error) {
    console.error("Error creating entity:", error);
    return null;
  }
};
export const deleteAllEntities = async (path: string): Promise<void> => {
  try {
    const entityRef = ref(database, path);
    await remove(entityRef);
    console.log(`All entities at path ${path} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting entities at path ${path}:`, error);
  }
};
export const filterData = (data, field, value) => {
  const filteredData = Object.entries(data).filter(([key, obj]) => {
    return obj[field] === value; // Use the 'field' parameter to filter data
  });
  return Object.fromEntries(filteredData);
};

// Get Entity
export const getEntity = async (path) => {
  try {
    const entityRef = ref(database, path);
    const snapshot = await get(entityRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("No data available");
      return null;
    }
  } catch (error) {
    console.error("Error getting entity:", error);
    return null;
  }
};

// Listen for real-time updates
export const onEntityChange = (path, callback) => {
  const entityRef = ref(database, path);
  const unsubscribe = onValue(entityRef, callback);
  return unsubscribe;
};

// Update Entity
export const updateEntity = async (path, data) => {
  try {
    const entityRef = ref(database, path);
    await update(entityRef, data);
    console.log("Entity updated successfully");
  } catch (error) {
    console.error("Error updating entity:", error);
  }
};

export const deleteEntity = async (path: string, id: string): Promise<void> => {
  try {
    const entityRef = ref(database, path);
    const snapshot = await get(entityRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key]) => key !== id)
      );

      await set(entityRef, filteredData);
      console.log("Entity deleted successfully");
    } else {
      console.log("No data available to delete");
    }
  } catch (error) {
    console.error("Error deleting entity:", error);
  }
};
export const createSpinHistory = async (
  linkId: string,
  spinResult: string
): Promise<void> => {
  try {
    const path = `spins/${linkId}`;
    const data = {
      result: spinResult,
      timestamp: new Date().toISOString(),
    };
    await createEntity(path, data);
    console.log("Spin history saved successfully");
  } catch (error) {
    console.error("Error saving spin history:", error);
  }
};
