import api from "./axiosInstance";

// POST /bids  → BidResponseDTO
// { reportId: UUID, bidAmount: number, durationEstimate: int, resourceNote?: string }
export const placeBidApi = (reportId, bidAmount, durationEstimate, resourceNote = "") =>
  api.post("/bids", { reportId, bidAmount, durationEstimate, resourceNote });

// GET /bids/my  → List<BidResponseDTO>
export const getMyBidsApi = () => api.get("/bids/my");

// DELETE /bids/{bidId}  → 204 No Content
export const withdrawBidApi = (bidId) => api.delete(`/bids/${bidId}`);
