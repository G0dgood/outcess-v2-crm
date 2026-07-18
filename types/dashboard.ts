export interface NestedOption {
  id: string;
  value: string;
  subLabel?: string;
  subOptions?: NestedOption[];
  autoSelect?: boolean;
}

export interface DispositionCategory {
  id: string;
  name: string;
  color: string;
  fieldType: string;
  dropdownOptions?: string[];
  nestedOptions?: NestedOption[];
  sortOrder?: string;
  isRequired?: boolean;
  isArchived?: boolean;
  backupId?: string;
  backupOfId?: string;
}

export interface AssignedMember {
  memberId: string | { _id?: string; id?: string };
  memberName?: string;
  duration?: number;
}

export interface CustomerField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  options?: string[]; // For dropdown, radio, checkbox fields
  icon?: string;
  [key: string]: unknown;
}

export interface Bucket {
  color: string;
  assignedMembers?: AssignedMember[];
  id: string;
  _id?: string;
  name: string;
  description?: string;
  dispositions: DispositionCategory[];
  customerFields?: CustomerField[];
  [key: string]: unknown;
}

export interface Widget {
  id: string;
  title: string;
  value: number;
  color: string;
  callOutcome?: string;
  subKey?: string;
  dataSourceName?: string;
}

export interface CallOutcome {
  id: string;
  name: string;
}

export interface Chart {
  id: string;
  title: string;
  type:
    | "bar"
    | "line"
    | "pie"
    | "doughnut"
    | "polarArea"
    | "radar"
    | "scatter"
    | "bubble";
  dataSource: string | string[]; // Support both single and multiple data sources
  timeRange: "daily" | "yesterday" | "weekly" | "monthly";
  color?: string; // Base color for backward compatibility
  colors?: Record<string, string>; // Map of data source to color for multiple data sources
  size: "small" | "medium" | "large"; // Chart size
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DashboardSettings {
  dashboardName: string;
  dashboardVisibility: "all" | "admin" | "admin-supervisor" | "custom";
  activeTab: "kpi" | "disposition";
  widgets: Widget[];
  dispositions: DispositionCategory[];
  buckets: Bucket[];
  callOutcomes: CallOutcome[];
  dispositionSettings: {
    timeRangeView:
      | "daily"
      | "yesterday"
      | "weekly"
      | "monthly"
      | "yearly"
      | "all";
    chartType:
      | "bar"
      | "line"
      | "pie"
      | "doughnut"
      | "polarArea"
      | "radar"
      | "scatter"
      | "bubble";
    charts: Chart[];
  };
}

export interface DashboardReportResponse {
  data: {
    totalDispositions: number;
    breakdown: Record<string, Record<string, number> | number>;
  };
}
