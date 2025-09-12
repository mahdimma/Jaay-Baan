import React from "react";
import type { IconName } from "../../types/icon";
import {
  Home,
  DoorOpen,
  Warehouse,
  Bookmark,
  Package,
  Box,
  Tag,
  MoreHorizontal,
  Plus,
  Edit3,
  Trash2,
  Move,
  Search,
  Filter,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  EyeOff,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Menu,
  X,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  FileText,
  BarChart3,
  List,
  Grid,
  Layers,
  Star,
  Camera,
  Hash,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  AlignJustify,
} from "lucide-react";

const iconMap = {
  // Location type icons
  home: Home,
  "door-open": DoorOpen,
  warehouse: Warehouse,
  bookmark: Bookmark,
  package: Package,
  box: Box,
  tag: Tag,
  "more-horizontal": MoreHorizontal,

  // Action icons
  plus: Plus,
  edit: Edit3,
  trash: Trash2,
  move: Move,
  search: Search,
  filter: Filter,
  upload: Upload,
  download: Download,
  refresh: RefreshCw,

  // Status icons
  "check-circle": CheckCircle,
  "alert-circle": AlertCircle,
  "x-circle": XCircle,
  eye: Eye,
  "eye-off": EyeOff,

  // Navigation icons
  settings: Settings,
  user: User,
  logout: LogOut,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevron-left": ChevronLeft,
  "arrow-left": ArrowLeft,
  menu: Menu,
  x: X,
  "panel-left-close": PanelLeftClose,
  "panel-left-open": PanelLeftOpen,
  "panel-right-close": PanelRightClose,
  "panel-right-open": PanelRightOpen,
  "align-justify": AlignJustify,

  // Info icons
  calendar: Calendar,
  clock: Clock,
  "map-pin": MapPin,
  image: ImageIcon,
  "file-text": FileText,
  "bar-chart": BarChart3,
  list: List,
  grid: Grid,
  layers: Layers,
  star: Star,
  camera: Camera,
  hash: Hash,
};

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = "", size = 20 }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} className={className} />;
};

export default Icon;
