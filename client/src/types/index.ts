export interface BreakdownItem {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number;
}

export interface BreakdownViewProps {
  portfolioId: number;
}

export interface BreakdownTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: BreakdownItem;
  }>;
}

export interface ESGViewProps {
  portfolioId: number;
}

export interface ESGComponent {
  name: string;
  value: number;
  fullMark: number;
  color: string;
}

export interface StressTestViewProps {
  portfolioId: number;
}

export interface StressTestResults {
  "oil-shock": number | null;
  "climate-policy": number | null;
  "market-crash": number | null;
}

export interface ScenarioInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
  riskLevel: string;
  timeframe: string;
  sectors: string[];
}

export interface ChartDataItem {
  name: string;
  value: number;
  impact: number;
  color: string;
  scenario: string;
}

export interface ScenarioResult {
  scenario: string;
  value: number;
}

export interface StressTestTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
  label?: string;
}

export interface DashboardTab {
  id: string;
  label: string;
  icon: string;
}

export interface Portfolio {
  id: number;
  name: string;
  uploadDate: string;
  s3Path: string;
}

export interface PortfolioUploadProps {
  onUploadSuccess: (portfolio: Portfolio) => void;
}