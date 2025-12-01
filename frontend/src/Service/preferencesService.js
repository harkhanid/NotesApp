import { API_DOMAIN } from "../constants/constants";
const API_URL = API_DOMAIN + "/api/user/preferences";

const getPreferences = async () => {
  try {
    const response = await fetch(API_URL, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch preferences");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching preferences:", error);
    throw error;
  }
};

const updatePreferences = async (preferences) => {
  try {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error("Failed to update preferences");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
};

const preferencesService = {
  getPreferences,
  updatePreferences,
};

export default preferencesService;
