import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { locationsApi, authApi } from "../services/api";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";
import type {
  SearchParams,
  CreateLocationData,
  UpdateLocationData,
  MoveLocationData,
  BulkOperationData,
  LoginData,
} from "../types";

// Query keys
export const queryKeys = {
  locations: ["locations"] as const,
  location: (id: number) => ["location", id] as const,
  tree: ["tree"] as const,
  breadcrumb: (id: number) => ["breadcrumb", id] as const,
  search: (params: SearchParams) => ["search", params] as const,
  statistics: ["statistics"] as const,
  needingCleaning: ["needing-cleaning"] as const,
};

// Auth hooks
export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      login(response.token, {
        id: response.user_id,
        username: response.username,
      });
      toast.success("ورود موفقیت‌آمیز بود");
    },
    onError: () => {
      toast.error("نام کاربری یا رمز عبور اشتباه است");
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("خروج موفقیت‌آمیز بود");
    },
  });
};

// Location hooks
export const useLocations = (params?: SearchParams) => {
  return useQuery({
    queryKey: [...queryKeys.locations, params],
    queryFn: () => locationsApi.getLocations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLocation = (id: number) => {
  return useQuery({
    queryKey: queryKeys.location(id),
    queryFn: () => locationsApi.getLocation(id),
    enabled: !!id,
  });
};

export const useLocationTree = (parentId?: number) => {
  return useQuery({
    queryKey: [...queryKeys.tree, parentId],
    queryFn: () => locationsApi.getTree(parentId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBreadcrumb = (id: number) => {
  return useQuery({
    queryKey: queryKeys.breadcrumb(id),
    queryFn: () => locationsApi.getBreadcrumb(id),
    enabled: !!id,
  });
};

export const useLocationSearch = (params: SearchParams) => {
  return useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => locationsApi.search(params),
    enabled: !!params.query || !!params.location_type || !!params.parent_id,
  });
};

export const useStatistics = () => {
  return useQuery({
    queryKey: queryKeys.statistics,
    queryFn: () => locationsApi.getStatistics(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLocationsNeedingCleaning = () => {
  return useQuery({
    queryKey: queryKeys.needingCleaning,
    queryFn: () => locationsApi.getNeedingCleaning(),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hooks
export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationData) => locationsApi.createLocation(data),
    onSuccess: (newLocation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics });

      if (newLocation.parent_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.location(newLocation.parent_id),
        });
      }

      toast.success("مکان جدید با موفقیت ایجاد شد");
    },
    onError: () => {
      toast.error("خطا در ایجاد مکان جدید");
    },
  });
};

export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: number } & Partial<UpdateLocationData>) =>
      locationsApi.updateLocation(id, data),
    onSuccess: (updatedLocation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
      queryClient.setQueryData(
        queryKeys.location(updatedLocation.id),
        updatedLocation
      );

      if (updatedLocation.parent_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.location(updatedLocation.parent_id),
        });
      }

      toast.success("مکان با موفقیت بروزرسانی شد");
    },
    onError: () => {
      toast.error("خطا در بروزرسانی مکان");
    },
  });
};

export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => locationsApi.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics });
      toast.success("مکان با موفقیت حذف شد");
    },
    onError: () => {
      toast.error("خطا در حذف مکان");
    },
  });
};

export const useMoveLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & MoveLocationData) =>
      locationsApi.moveLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
      toast.success("مکان با موفقیت جابجا شد");
    },
    onError: () => {
      toast.error("خطا در جابجایی مکان");
    },
  });
};

export const useMarkCleaned = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => locationsApi.markCleaned(id),
    onSuccess: (updatedLocation) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.needingCleaning });
      queryClient.setQueryData(
        queryKeys.location(updatedLocation.id),
        updatedLocation
      );
      toast.success("مکان به عنوان تمیز علامت‌گذاری شد");
    },
    onError: () => {
      toast.error("خطا در علامت‌گذاری مکان");
    },
  });
};

export const useBulkOperations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkOperationData) => locationsApi.bulkOperations(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      queryClient.invalidateQueries({ queryKey: queryKeys.tree });
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics });
      queryClient.invalidateQueries({ queryKey: queryKeys.needingCleaning });
      toast.success(response.message || "عملیات گروهی با موفقیت انجام شد");
    },
    onError: () => {
      toast.error("خطا در انجام عملیات گروهی");
    },
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      locationId,
      formData,
    }: {
      locationId: number;
      formData: FormData;
    }) => locationsApi.uploadImage(locationId, formData),
    onSuccess: (_, { locationId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.location(locationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      toast.success("تصویر با موفقیت آپلود شد");
    },
    onError: () => {
      toast.error("خطا در آپلود تصویر");
    },
  });
};
