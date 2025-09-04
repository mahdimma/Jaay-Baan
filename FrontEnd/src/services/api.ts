import api from "../lib/api";
import type {
  Location,
  PaginatedResponse,
  SearchParams,
  CreateLocationData,
  UpdateLocationData,
  MoveLocationData,
  BulkOperationData,
  AuthResponse,
  LoginData,
  Statistics,
  BreadcrumbItem,
  TreeNode,
} from "../types";

// Auth API
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post("/auth/login/", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout/");
  },
};

// Locations API
export const locationsApi = {
  getLocations: async (
    params?: SearchParams
  ): Promise<PaginatedResponse<Location>> => {
    const response = await api.get("/locations/", { params });
    return response.data;
  },

  getLocation: async (id: number): Promise<Location> => {
    const response = await api.get(`/locations/${id}/`);
    return response.data;
  },

  createLocation: async (data: CreateLocationData): Promise<Location> => {
    const response = await api.post("/locations/", data);
    return response.data;
  },

  updateLocation: async (
    id: number,
    data: Partial<UpdateLocationData>
  ): Promise<Location> => {
    const response = await api.patch(`/locations/${id}/`, data);
    return response.data;
  },

  deleteLocation: async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}/`);
  },

  moveLocation: async (
    id: number,
    data: MoveLocationData
  ): Promise<Location> => {
    const response = await api.post(`/locations/${id}/move/`, data);
    return response.data;
  },

  markCleaned: async (id: number): Promise<Location> => {
    const response = await api.post(`/locations/${id}/mark-cleaned/`);
    return response.data;
  },

  getTree: async (parentId?: number): Promise<TreeNode[]> => {
    const params = parentId ? { parent_id: parentId } : {};
    const response = await api.get("/locations/tree/", { params });
    return response.data;
  },

  getBreadcrumb: async (id: number): Promise<BreadcrumbItem[]> => {
    const response = await api.get(`/locations/${id}/breadcrumb/`);
    return response.data;
  },

  search: async (
    params: SearchParams
  ): Promise<PaginatedResponse<Location>> => {
    const response = await api.get("/locations/search/", { params });
    return response.data;
  },

  getNeedingCleaning: async (): Promise<PaginatedResponse<Location>> => {
    const response = await api.get("/locations/needing-cleaning/");
    return response.data;
  },

  getStatistics: async (): Promise<Statistics> => {
    const response = await api.get("/locations/statistics/");
    return response.data;
  },

  bulkOperations: async (
    data: BulkOperationData
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/locations/bulk-operations/", data);
    return response.data;
  },

  exportData: async (): Promise<Blob> => {
    const response = await api.get("/locations/export/", {
      responseType: "blob",
    });
    return response.data;
  },

  // Image operations
  uploadImage: async (
    locationId: number,
    formData: FormData
  ): Promise<void> => {
    await api.post(`/locations/${locationId}/images/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteImage: async (locationId: number, imageId: number): Promise<void> => {
    await api.delete(`/locations/${locationId}/images/${imageId}/`);
  },
};
