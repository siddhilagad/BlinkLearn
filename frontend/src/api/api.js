// src/api/api.js
import axios from "axios";

// ─── Base instance ────────────────────────────────────────────────
const API = axios.create({
  baseURL: "http://localhost:5000",
});

// ─── AUTH ─────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
  const res = await API.post("/login", { email, password });
  return res.data; // { message, user }
};

export const registerUser = async ({ fullname, email, password, accountType }) => {
  const res = await API.post("/register", { fullname, email, password, accountType });
  return res.data;
};

// ─── COURSES ──────────────────────────────────────────────────────

/**
 * Add a new course (multipart/form-data)
 * @param {FormData} formData - must include: title, description, price, level,
 *                              category, teacher_id, thumbnail (file),
 *                              preview_video (file, optional)
 */
export const addCourse = async (formData) => {
  const res = await API.post("/api/add-course", formData);
  // Do NOT set Content-Type manually — axios sets multipart boundary automatically
  return res.data;
};

/**
 * Get all courses (optional search query)
 * @param {string} search - optional search keyword
 */
export const getAllCourses = async (search = "") => {
  const res = await API.get("/api/courses", {
    params: search ? { search } : {},
  });
  return res.data;
};

/**
 * Get a single course by ID
 * @param {number|string} courseId
 */
export const getCourse = async (courseId) => {
  const res = await API.get(`/api/course/${courseId}`);
  return res.data;
};

/**
 * Get all courses by a teacher
 * @param {number|string} teacherId
 */
export const getTeacherCourses = async (teacherId) => {
  const res = await API.get(`/api/teacher-courses/${teacherId}`);
  return res.data;
};

/**
 * Edit an existing course (multipart/form-data)
 * @param {number|string} courseId
 * @param {FormData} formData
 */
export const editCourse = async (courseId, formData) => {
  const res = await API.put(`/api/edit-course/${courseId}`, formData);
  return res.data;
};

/**
 * Delete a course
 * @param {number|string} courseId
 */
export const deleteCourse = async (courseId) => {
  const res = await API.delete(`/api/delete-course/${courseId}`);
  return res.data;
};

// ─── ENROLLMENT ───────────────────────────────────────────────────

/**
 * Enroll a student in a course
 * @param {number|string} user_id
 * @param {number|string} course_id
 */
export const enrollCourse = async (user_id, course_id) => {
  const res = await API.post("/api/enroll", { user_id, course_id });
  return res.data;
};

/**
 * Check if a user is enrolled in a course
 * @param {number|string} userId
 * @param {number|string} courseId
 */
export const checkEnrollment = async (userId, courseId) => {
  const res = await API.get(`/check-enrollment/${userId}/${courseId}`);
  return res.data; // { enrolled: true/false }
};

// ─── PROFILE ──────────────────────────────────────────────────────

/**
 * Upload profile photo
 * @param {number|string} user_id
 * @param {File} photoFile
 */
export const uploadProfilePhoto = async (user_id, photoFile) => {
  const formData = new FormData();
  formData.append("user_id", user_id);
  formData.append("profilePhoto", photoFile);
  const res = await API.post("/upload-profile-photo", formData);
  return res.data; // { profilePhoto: filename }
};

// ─── STATS ────────────────────────────────────────────────────────

/**
 * Get student stats (enrolled count, wishlist count, etc.)
 * @param {number|string} userId
 */
export const getStudentStats = async (userId) => {
  const res = await API.get(`/student-stats/${userId}`);
  return res.data;
};

/**
 * Get total students for a teacher
 * @param {number|string} teacherId
 */
export const getTeacherStudents = async (teacherId) => {
  const res = await API.get(`/teacher-students/${teacherId}`);
  return res.data; // { totalStudents }
};

// ─── ROLE ─────────────────────────────────────────────────────────

/**
 * Switch user role between student and teacher
 * @param {number|string} userId
 * @param {"student"|"teacher"} role
 */
export const switchRole = async (userId, role) => {
  const res = await API.put(`/switch-role/${userId}`, { role });
  return res.data;
};