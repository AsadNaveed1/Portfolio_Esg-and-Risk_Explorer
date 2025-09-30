import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import api from "../api";
import type { BreakdownItem, BreakdownViewProps, BreakdownTooltipProps } from "../types";

export default function BreakdownView({ portfolioId }: BreakdownViewProps) {
  const [sectorData, setSectorData] = useState<BreakdownItem[]>([]);
  const [regionData, setRegionData] = useState<BreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'charts' | 'table'>('charts');

  useEffect(() => {
    const fetchBreakdownData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sectorResponse, regionResponse] = await Promise.all([
          api.get(`/${portfolioId}/breakdown/sector`),
          api.get(`/${portfolioId}/breakdown/region`)
        ]);

        const formattedSectorData = Object.entries(sectorResponse.data as Record<string, number>)
          .map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            percentage: parseFloat(((value / getTotalValue(sectorResponse.data as Record<string, number>)) * 100).toFixed(1))
          }))
          .sort((a, b) => b.value - a.value);

        const formattedRegionData = Object.entries(regionResponse.data as Record<string, number>)
          .map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2)),
            percentage: parseFloat(((value / getTotalValue(regionResponse.data as Record<string, number>)) * 100).toFixed(1))
          }))
          .sort((a, b) => b.value - a.value);

        setSectorData(formattedSectorData);
        setRegionData(formattedRegionData);
      } catch (err) {
        console.error("Breakdown fetch failed", err);
        setError("Failed to load portfolio breakdown. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdownData();
  }, [portfolioId]);

  const getTotalValue = (data: Record<string, number>): number => {
    return Object.values(data).reduce((sum, value) => sum + value, 0);
  };

  const SECTOR_COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', 
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
    '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
  ];

  const REGION_COLORS = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
  ];

  const CustomTooltip = ({ active, payload }: BreakdownTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <TooltipContainer>
          <TooltipTitle>{data.name}</TooltipTitle>
          <TooltipValue>Weight: {data.value}</TooltipValue>
          <TooltipPercentage>{data.percentage}% of portfolio</TooltipPercentage>
        </TooltipContainer>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading portfolio breakdown...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>📊</ErrorIcon>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={() => window.location.reload()}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderTitle>Portfolio Breakdown</HeaderTitle>
          <HeaderSubtitle>Diversification across sectors and regions</HeaderSubtitle>
        </HeaderContent>
        <ViewToggle>
          <ViewButton 
            $active={activeView === 'charts'} 
            onClick={() => setActiveView('charts')}
          >
            📊 Charts
          </ViewButton>
          <ViewButton 
            $active={activeView === 'table'} 
            onClick={() => setActiveView('table')}
          >
            📋 Table
          </ViewButton>
        </ViewToggle>
      </Header>

      {activeView === 'charts' ? (
        <ChartsGrid>
          <ChartSection>
            <SectionHeader>
              <SectionTitle>Sector Allocation</SectionTitle>
              <SectionSubtitle>{sectorData.length} sectors</SectionSubtitle>
            </SectionHeader>
            {sectorData.length === 0 ? (
              <NoDataMessage>No sector data available</NoDataMessage>
            ) : (
              <ChartContainer>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={60}
                      paddingAngle={2}
                    >
                      {sectorData.map((_, index) => (
                        <Cell 
                          key={`sector-${index}`} 
                          fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={60}
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </ChartSection>

          <ChartSection>
            <SectionHeader>
              <SectionTitle>Geographic Allocation</SectionTitle>
              <SectionSubtitle>{regionData.length} regions</SectionSubtitle>
            </SectionHeader>
            {regionData.length === 0 ? (
              <NoDataMessage>No region data available</NoDataMessage>
            ) : (
              <ChartContainer>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={regionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      radius={[4, 4, 0, 0]}
                    >
                      {regionData.map((_, index) => (
                        <Cell 
                          key={`region-${index}`} 
                          fill={REGION_COLORS[index % REGION_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </ChartSection>

          <SummarySection>
            <SummaryCard>
              <SummaryIcon>🏭</SummaryIcon>
              <SummaryContent>
                <SummaryTitle>Top Sector</SummaryTitle>
                <SummaryValue>
                  {sectorData[0]?.name || 'N/A'}
                </SummaryValue>
                <SummarySubtext>
                  {sectorData[0]?.percentage || 0}% allocation
                </SummarySubtext>
              </SummaryContent>
            </SummaryCard>

            <SummaryCard>
              <SummaryIcon>🌍</SummaryIcon>
              <SummaryContent>
                <SummaryTitle>Top Region</SummaryTitle>
                <SummaryValue>
                  {regionData[0]?.name || 'N/A'}
                </SummaryValue>
                <SummarySubtext>
                  {regionData[0]?.percentage || 0}% allocation
                </SummarySubtext>
              </SummaryContent>
            </SummaryCard>

            <SummaryCard>
              <SummaryIcon>📈</SummaryIcon>
              <SummaryContent>
                <SummaryTitle>Diversification</SummaryTitle>
                <SummaryValue>
                  {sectorData.length + regionData.length}
                </SummaryValue>
                <SummarySubtext>
                  Total categories
                </SummarySubtext>
              </SummaryContent>
            </SummaryCard>
          </SummarySection>
        </ChartsGrid>
      ) : (
        <TableGrid>
          <TableSection>
            <SectionTitle>Sector Breakdown</SectionTitle>
            <DataTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Sector</TableHeaderCell>
                  <TableHeaderCell>Weight</TableHeaderCell>
                  <TableHeaderCell>Percentage</TableHeaderCell>
                  <TableHeaderCell>Visual</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectorData.map((item, index) => (
                  <TableRow key={item.name}>
                    <TableCell>
                      <CategoryCell>
                        <ColorIndicator $color={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                        {item.name}
                      </CategoryCell>
                    </TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.percentage}%</TableCell>
                    <TableCell>
                      <ProgressBar>
                        <ProgressFill 
                          $width={item.percentage} 
                          $color={SECTOR_COLORS[index % SECTOR_COLORS.length]} 
                        />
                      </ProgressBar>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </TableSection>

          <TableSection>
            <SectionTitle>Regional Breakdown</SectionTitle>
            <DataTable>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Region</TableHeaderCell>
                  <TableHeaderCell>Weight</TableHeaderCell>
                  <TableHeaderCell>Percentage</TableHeaderCell>
                  <TableHeaderCell>Visual</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionData.map((item, index) => (
                  <TableRow key={item.name}>
                    <TableCell>
                      <CategoryCell>
                        <ColorIndicator $color={REGION_COLORS[index % REGION_COLORS.length]} />
                        {item.name}
                      </CategoryCell>
                    </TableCell>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.percentage}%</TableCell>
                    <TableCell>
                      <ProgressBar>
                        <ProgressFill 
                          $width={item.percentage} 
                          $color={REGION_COLORS[index % REGION_COLORS.length]} 
                        />
                      </ProgressBar>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </TableSection>
        </TableGrid>
      )}
    </Container>
  );
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  padding: 32px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
`;

const HeaderContent = styled.div``;

const HeaderTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 8px 0;
`;

const HeaderSubtitle = styled.p`
  font-size: 16px;
  color: #64748b;
  margin: 0;
`;

const ViewToggle = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#667eea' : '#64748b'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'};
  
  &:hover {
    color: #667eea;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TableGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const TableSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const SectionHeader = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 350px;
`;

const SummarySection = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const SummaryCard = styled.div`
  flex: 1;
  min-width: 200px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SummaryIcon = styled.div`
  font-size: 32px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryTitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 2px;
`;

const SummarySubtext = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead``;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e2e8f0;
  
  &:hover {
    background: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  text-align: left;
  padding: 12px 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 2px solid #e2e8f0;
`;

const TableCell = styled.td`
  padding: 12px 8px;
  font-size: 14px;
  color: #374151;
`;

const CategoryCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorIndicator = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  border-radius: 3px;
  transition: width 0.8s ease-out;
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: #64748b;
  padding: 40px;
  font-style: italic;
`;

const TooltipContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
`;

const TooltipTitle = styled.div`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
`;

const TooltipValue = styled.div`
  color: #64748b;
  font-size: 14px;
`;

const TooltipPercentage = styled.div`
  color: #667eea;
  font-size: 12px;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.div`
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
`;

const ErrorText = styled.div`
  font-size: 16px;
  color: #ef4444;
  text-align: center;
  max-width: 400px;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #5a67d8;
  }
`;