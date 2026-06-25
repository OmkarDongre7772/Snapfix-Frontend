import api from "./axiosInstance";

// GET /user/me  → UserResponse { userId, email, role, profile }
export const getMeApi = () => api.get("/user/me");

// PUT /user/profile  → ProfileDTO (CitizenProfileDTO | WorkerProfileDTO)
// data: { name, latitude?, longitude?, skills? }
export const updateProfileApi = (data) => api.put("/user/profile", data);
