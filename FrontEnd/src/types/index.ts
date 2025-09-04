export interface Location {
  id: number;
  name: string;
  location_type: LocationType;
  description: string;
  is_container: boolean;
  barcode?: string;
  quantity: number;
  value?: number;
  cleaned_time?: string;
  cleaned_duration: number; // Cleaning interval in days
  created_at: string;
  updated_at: string;
  breadcrumb: string;
  children_count: number;
  needs_cleaning: boolean;
  images: LocationImage[];
  parent_id?: number;
}

export interface LocationImage {
  id: number;
  image: string;
  description?: string;
  is_primary: boolean;
  created_at: string;
}

export type LocationType =
  | "house"
  | "room"
  | "storage"
  | "shelf"
  | "container"
  | "box"
  | "item"
  | "other";

export interface LocationTypeInfo {
  name: string;
  count: number;
}

export interface Statistics {
  total_locations: number;
  containers: number;
  items: number;
  locations_needing_cleaning: number;
  locations_with_images: number;
  locations_with_barcode: number;
  by_type: Record<LocationType, LocationTypeInfo>;
}

export interface TreeNode extends Location {
  children?: TreeNode[];
  level?: number;
}

export interface BreadcrumbItem {
  id: number;
  name: string;
  location_type: LocationType;
}

export interface SearchParams {
  query?: string;
  location_type?: LocationType;
  needs_cleaning?: boolean;
  has_barcode?: boolean;
  parent_id?: number | "root";
  page?: number;
  page_size?: number;
}

export interface CreateLocationData {
  name: string;
  location_type: LocationType;
  description?: string;
  is_container: boolean;
  parent_id?: number;
  barcode?: string;
  quantity?: number;
  value?: number;
  cleaned_duration?: number; // Cleaning interval in days
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  id: number;
}

export interface MoveLocationData {
  new_parent_id?: number | null;
}

export interface BulkOperationData {
  operation: "mark_cleaned" | "delete" | "move_to_parent";
  location_ids: number[];
  new_parent_id?: number;
}

export interface AuthResponse {
  token: string;
  user_id: number;
  username: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: string[] | string | undefined;
}
