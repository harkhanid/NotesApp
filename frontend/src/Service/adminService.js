import { API_DOMAIN } from "../constants/constants";
import { api } from "../utils/apiClient.js";

const API_URL = API_DOMAIN + "/api/admin";

/**
 * Get all users with optional filtering
 * @param {string} filter - Filter type: 'all', 'pending', 'approved', 'rejected'
 */
const getUsers = async (filter = 'all') => {
  try {
    const response = await api.get(`${API_URL}/users?filter=${filter}`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get pending users only
 */
const getPendingUsers = async () => {
  try {
    const response = await api.get(`${API_URL}/users/pending`);
    if (!response.ok) {
      throw new Error("Failed to fetch pending users");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching pending users:", error);
    throw error;
  }
};

/**
 * Get a specific user by ID
 * @param {number} userId - User ID
 */
const getUserById = async (userId) => {
  try {
    const response = await api.get(`${API_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

/**
 * Approve a user account
 * @param {number} userId - User ID to approve
 */
const approveUser = async (userId) => {
  try {
    const response = await api.put(`${API_URL}/users/${userId}/approve`);
    if (!response.ok) {
      throw new Error("Failed to approve user");
    }
    return await response.json();
  } catch (error) {
    console.error("Error approving user:", error);
    throw error;
  }
};

/**
 * Reject a user account
 * @param {number} userId - User ID to reject
 */
const rejectUser = async (userId) => {
  try {
    const response = await api.put(`${API_URL}/users/${userId}/reject`);
    if (!response.ok) {
      throw new Error("Failed to reject user");
    }
    return await response.json();
  } catch (error) {
    console.error("Error rejecting user:", error);
    throw error;
  }
};

/**
 * Make a user an admin
 * @param {number} userId - User ID to promote
 */
const makeAdmin = async (userId) => {
  try {
    const response = await api.put(`${API_URL}/users/${userId}/make-admin`);
    if (!response.ok) {
      throw new Error("Failed to make user admin");
    }
    return await response.json();
  } catch (error) {
    console.error("Error making user admin:", error);
    throw error;
  }
};

/**
 * Remove admin role from a user
 * @param {number} userId - User ID to demote
 */
const removeAdmin = async (userId) => {
  try {
    const response = await api.put(`${API_URL}/users/${userId}/remove-admin`);
    if (!response.ok) {
      throw new Error("Failed to remove admin role");
    }
    return await response.json();
  } catch (error) {
    console.error("Error removing admin role:", error);
    throw error;
  }
};

const adminService = {
  getUsers,
  getPendingUsers,
  getUserById,
  approveUser,
  rejectUser,
  makeAdmin,
  removeAdmin,
};

export default adminService;
