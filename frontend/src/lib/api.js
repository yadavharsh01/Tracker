import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the auth token to every request automatically.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If a token expires or is invalid, clear it and send the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// --- Auth ---
export const signup = (data) => api.post("/auth/signup", data);
export const login = (data) => api.post("/auth/login", data);
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const resetPassword = (email, token, newPassword) =>
  api.post("/auth/reset-password", { email, token, newPassword });
export const changePassword = (currentPassword, newPassword) =>
  api.put("/auth/change-password", { currentPassword, newPassword });
export const requestOtp = (identifier) => api.post("/auth/otp/request", { identifier });
export const verifyOtp = (identifier, otp) => api.post("/auth/otp/verify", { identifier, otp });

// --- User ---
export const getProfile = () => api.get("/user/profile");
export const setExamDate = (examDate) => api.put("/user/exam-date", { examDate });
export const setTargetPercentile = (targetPercentile) =>
  api.put("/user/target-percentile", { targetPercentile });
export const updateProfile = (data) => api.put("/user/profile", data);
export const deleteAccount = (password) => api.delete("/user/account", { data: { password } });
export const exportData = () => api.get("/user/export");

// --- Sessions ---
export const addSession = (data) => api.post("/sessions/add", data);
export const getSessionStats = () => api.get("/sessions/stats");
export const getTimeBySubject = () => api.get("/sessions/by-subject");
export const listSessions = (range) => api.get("/sessions", { params: range ? { range } : {} });

// --- Mock Tests ---
export const listMockTests = () => api.get("/mocktests");
export const createMockTest = (data) => api.post("/mocktests", data);
export const updateMockTest = (id, data) => api.put(`/mocktests/${id}`, data);
export const deleteMockTest = (id) => api.delete(`/mocktests/${id}`);
export const getMockTestAnalysis = () => api.get("/mocktests/analysis");

// --- Sectional Tests (single-section practice, distinct from full mocks) ---
export const listSectionalTests = (section) =>
  api.get("/sectionaltests", { params: section ? { section } : {} });
export const createSectionalTest = (data) => api.post("/sectionaltests", data);
export const updateSectionalTest = (id, data) => api.put(`/sectionaltests/${id}`, data);
export const deleteSectionalTest = (id) => api.delete(`/sectionaltests/${id}`);
export const getSectionalAnalysis = () => api.get("/sectionaltests/analysis");

// --- Goals ---
export const listGoalProgress = () => api.get("/goals");
export const setGoal = (period, targetMinutes) => api.post("/goals", { period, targetMinutes });

// --- Topics (planner / topic tracker) ---
export const seedTopics = () => api.post("/topics/seed");
export const listTopics = () => api.get("/topics");
export const addTopic = (section, name) => api.post("/topics", { section, name });
export const updateTopicMastery = (id, mastery) => api.put(`/topics/${id}`, { mastery });
export const deleteTopic = (id) => api.delete(`/topics/${id}`);
export const getTopicsDue = () => api.get("/topics/due");
export const markTopicRevised = (id) => api.put(`/topics/${id}/revise`);

// --- Badges ---
export const listBadges = () => api.get("/badges");

// --- AI Coach ---
export const getInsights = () => api.get("/insights");

// --- College Targets (WAT-PI tracker / shortlist) ---
export const listColleges = () => api.get("/colleges");
export const addCollege = (data) => api.post("/colleges", data);
export const updateCollege = (id, data) => api.put(`/colleges/${id}`, data);
export const deleteCollege = (id) => api.delete(`/colleges/${id}`);

// --- Admin ---
export const adminListUsers = () => api.get("/admin/users");
export const adminGetUser = (id) => api.get(`/admin/users/${id}`);
export const adminGetUserLogins = (id) => api.get(`/admin/users/${id}/logins`);
export const adminGetAllLogins = () => api.get("/admin/logins");

// --- Push notifications ---
export const getPushPublicKey = () => api.get("/push/public-key");
export const subscribePush = (subscription) => api.post("/push/subscribe", subscription);
export const unsubscribePush = (endpoint) => api.post("/push/unsubscribe", { endpoint });
export const testPush = () => api.post("/push/test");

// --- Leaderboard ---
export const getLeaderboard = () => api.get("/leaderboard");
export const setLeaderboardOptIn = (optIn) => api.put("/user/leaderboard-opt-in", { optIn });
