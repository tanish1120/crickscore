import axios from "axios";

const API_URL = "http://localhost:3000/";

export const signup = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}signup`, formData);
    return response.data;
  } catch (error) {
    console.error(
      "Error during signup:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const login = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}login`, formData);
    return response.data;
  } catch (error) {
    console.error(
      "Error during login:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
