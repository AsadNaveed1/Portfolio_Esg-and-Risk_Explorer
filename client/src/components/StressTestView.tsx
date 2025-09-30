import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import api from "../api";
import type{
  StressTestViewProps,
  StressTestResults,
  ScenarioInfo,
  ChartDataItem,
  ScenarioResult,
  StressTestTooltipProps
} from "../types";

export default function StressTestView({ portfolioId }: StressTestViewProps) {
  const [results, setResults] = useState<StressTestResults>({
    "oil-shock": null,
    "climate-policy": null,
    "market-crash": null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [originalTotal, setOriginalTotal] = useState<number>(100); // Default fallback

  const scenarioInfo: Record<keyof StressTestResults, ScenarioInfo> = {
    "oil-shock": {
      name: "Oil Price Shock",
      description: "Sudden 50% drop in oil prices affecting energy sector",
      icon: "⛽",
      color: "#ef4444",
      riskLevel: "High",
      timeframe: "Immediate",
      sectors: ["Energy", "Utilities"]
    },
    "climate-policy": {
      name: "Climate Policy Impact",
      description: "New environmental regulations penalizing carbon-intensive sectors",
      icon: "🌿",
      color: "#f59e0b",
      riskLevel: "Medium",
      timeframe: "6-12 months",
      sectors: ["Energy", "Utilities", "Manufacturing"]
    },
    "market-crash": {
      name: "Market Crash",
      description: "Broad market decline affecting all holdings equally",
      icon: "📉",
      color: "#dc2626",
      riskLevel: "Extreme",
      timeframe: "Immediate",
      sectors: ["All Sectors"]
    }
  };

  useEffect(() => {
    const fetchStressTestResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get the breakdown to calculate original total
        const sectorResponse = await api.get(`/${portfolioId}/breakdown/sector`);
        const total = Object.values(sectorResponse.data as Record<string, number>)
          .reduce((sum, value) => sum + value, 0);
        setOriginalTotal(total);

        const promises = Object.keys(results).map(async (scenario) => {
          try {
            const response = await api.get(`/${portfolioId}/stress/${scenario}`);
            return { scenario, value: response.data };
          } catch (err) {
            console.error(`Failed to fetch ${scenario}`, err);
            return { scenario, value: null };
          }
        });

        const scenarioResults = await Promise.all(promises);
        
        const newResults: StressTestResults = {
          "oil-shock": null,
          "climate-policy": null,
          "market-crash": null,
        };
        
        scenarioResults.forEach(({ scenario, value }) => {
          newResults[scenario as keyof StressTestResults] = value;
        });

        setResults(newResults);
      } catch (err) {
        console.error("Failed to fetch stress test results", err);
        setError("Failed to load stress test data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStressTestResults();
  }, [portfolioId]);

  const getChartData = (): ChartDataItem[] => {
    return Object.entries(results)
      .filter(([, value]) => value !== null)
      .map(([scenario, value]) => ({
        name: scenarioInfo[scenario as keyof StressTestResults].name,
        value: value as number, // Keep as raw percentage points
        impact: originalTotal - (value as number), // Calculate absolute loss
        color: scenarioInfo[scenario as keyof StressTestResults].color,
        scenario
      }))
      .sort((a, b) => a.value - b.value);
  };

  const getWorstCase = (): ScenarioResult | null => {
    const validResults = Object.entries(results).filter(([, value]) => value !== null) as Array<[string, number]>;
    if (validResults.length === 0) return null;
    
    return validResults.reduce((worst, [scenario, value]) => 
      value < worst.value ? { scenario, value } : worst
    , { scenario: validResults[0][0], value: validResults[0][1] });
  };

  const getBestCase = (): ScenarioResult | null => {
    const validResults = Object.entries(results).filter(([, value]) => value !== null) as Array<[string, number]>;
    if (validResults.length === 0) return null;
    
    return validResults.reduce((best, [scenario, value]) => 
      value > best.value ? { scenario, value } : best
    , { scenario: validResults[0][0], value: validResults[0][1] });
  };

  const getRiskScore = (): number => {
    const validResults = Object.entries(results).filter(([, value]) => value !== null) as Array<[string, number]>;
    if (validResults.length === 0) return 0;
    
    // Calculate average loss percentage
    const avgLoss = validResults.reduce((sum, [, value]) => {
        const lossPercent = ((originalTotal - (value as number)) / originalTotal) * 100;
        return sum + lossPercent;
    }, 0) / validResults.length;
    
    return Math.max(0, avgLoss); // Ensure non-negative
  };

  const CustomTooltip = ({ active, payload, label }: StressTestTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const lossPercent = ((originalTotal - data.value) / originalTotal * 100);
      return (
        <TooltipContainer>
          <TooltipTitle>{label}</TooltipTitle>
          <TooltipValue>Portfolio Value: {data.value.toFixed(1)} points</TooltipValue>
          <TooltipImpact>Potential Loss: {lossPercent.toFixed(1)}%</TooltipImpact>
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
          <LoadingText>Running stress test scenarios...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={() => window.location.reload()}>
            Retry Analysis
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  const chartData = getChartData();
  const worstCase = getWorstCase();
  const bestCase = getBestCase();
  const riskScore = getRiskScore();

  return (
    <Container>
      <Header>
        <HeaderContent>
          <HeaderTitle>Stress Test Analysis</HeaderTitle>
          <HeaderSubtitle>Portfolio resilience under adverse market conditions</HeaderSubtitle>
        </HeaderContent>
        <RiskMeter>
          <RiskMeterTitle>Overall Risk Score</RiskMeterTitle>
          <RiskScore $risk={riskScore}>
            {riskScore.toFixed(0)}%
          </RiskScore>
          <RiskLabel $risk={riskScore}>
            {riskScore > 40 ? 'High Risk' : riskScore > 20 ? 'Medium Risk' : 'Low Risk'}
          </RiskLabel>
        </RiskMeter>
      </Header>

      <ContentGrid>
        <SummarySection>
          <SummaryCard>
            <SummaryIcon $color="#dc2626">📉</SummaryIcon>
            <SummaryContent>
              <SummaryTitle>Worst Case Scenario</SummaryTitle>
              <SummaryValue $color="#dc2626">
                {worstCase ? `${worstCase.value.toFixed(1)} pts` : 'N/A'}
              </SummaryValue>
              <SummarySubtext>
                {worstCase ? scenarioInfo[worstCase.scenario as keyof StressTestResults].name : 'No data'}
              </SummarySubtext>
            </SummaryContent>
          </SummaryCard>

          <SummaryCard>
            <SummaryIcon $color="#059669">📈</SummaryIcon>
            <SummaryContent>
              <SummaryTitle>Best Case Scenario</SummaryTitle>
              <SummaryValue $color="#059669">
                {bestCase ? `${bestCase.value.toFixed(1)} pts` : 'N/A'}
              </SummaryValue>
              <SummarySubtext>
                {bestCase ? scenarioInfo[bestCase.scenario as keyof StressTestResults].name : 'No data'}
              </SummarySubtext>
            </SummaryContent>
          </SummaryCard>

          <SummaryCard>
            <SummaryIcon $color="#7c3aed">🎯</SummaryIcon>
            <SummaryContent>
              <SummaryTitle>Scenarios Tested</SummaryTitle>
              <SummaryValue $color="#7c3aed">
                {Object.values(results).filter(v => v !== null).length}
              </SummaryValue>
              <SummarySubtext>
                Risk scenarios analyzed
              </SummarySubtext>
            </SummaryContent>
          </SummaryCard>
        </SummarySection>

        <ChartSection>
          <SectionTitle>Portfolio Value Under Stress</SectionTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  domain={[0, originalTotal]}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartSection>

        <ScenariosSection>
          <SectionTitle>Scenario Details</SectionTitle>
          <ScenariosList>
            {Object.entries(results).map(([scenario, value]) => {
              const info = scenarioInfo[scenario as keyof StressTestResults];
              const isSelected = selectedScenario === scenario;
              const lossPercent = value ? ((originalTotal - value) / originalTotal * 100) : 0;
              
              return (
                <ScenarioCard 
                  key={scenario}
                  $selected={isSelected}
                  onClick={() => setSelectedScenario(isSelected ? null : scenario)}
                >
                  <ScenarioHeader>
                    <ScenarioIcon>{info.icon}</ScenarioIcon>
                    <ScenarioBasicInfo>
                      <ScenarioName>{info.name}</ScenarioName>
                      <ScenarioTimeframe>{info.timeframe}</ScenarioTimeframe>
                    </ScenarioBasicInfo>
                    <ScenarioResult>
                      {value === null ? (
                        <ResultError>Error</ResultError>
                      ) : (
                        <>
                          <ResultValue $color={info.color}>
                            {value.toFixed(1)} pts
                          </ResultValue>
                          <ResultImpact>
                            {lossPercent.toFixed(1)}% loss
                          </ResultImpact>
                        </>
                      )}
                    </ScenarioResult>
                    <RiskBadge $risk={info.riskLevel}>
                      {info.riskLevel}
                    </RiskBadge>
                  </ScenarioHeader>
                  
                  {isSelected && (
                    <ScenarioDetails>
                      <DetailDescription>{info.description}</DetailDescription>
                      <DetailSectors>
                        <DetailLabel>Affected Sectors:</DetailLabel>
                        <SectorTags>
                          {info.sectors.map(sector => (
                            <SectorTag key={sector}>{sector}</SectorTag>
                          ))}
                        </SectorTags>
                      </DetailSectors>
                    </ScenarioDetails>
                  )}
                </ScenarioCard>
              );
            })}
          </ScenariosList>
        </ScenariosSection>
      </ContentGrid>
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

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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
  gap: 24px;
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

const RiskMeter = styled.div`
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  min-width: 180px;
`;

const RiskMeterTitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const RiskScore = styled.div<{ $risk: number }>`
  font-size: 36px;
  font-weight: 800;
  color: ${props => props.$risk > 40 ? '#dc2626' : props.$risk > 20 ? '#f59e0b' : '#059669'};
  margin-bottom: 4px;
  animation: ${pulse} 2s infinite;
`;

const RiskLabel = styled.div<{ $risk: number }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$risk > 40 ? '#dc2626' : props.$risk > 20 ? '#f59e0b' : '#059669'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
`;

const SummarySection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const SummaryIcon = styled.div<{ $color: string }>`
  font-size: 32px;
  width: 60px;
  height: 60px;
  background: ${props => props.$color}15;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${props => props.$color}30;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryTitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div<{ $color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color};
  margin-bottom: 2px;
`;

const SummarySubtext = styled.div`
  font-size: 12px;
  color: #64748b;
`;

const ChartSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ScenariosSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 20px 0;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`;

const ScenariosList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ScenarioCard = styled.div<{ $selected: boolean }>`
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$selected ? '#f8fafc' : 'white'};
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ScenarioHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ScenarioIcon = styled.div`
  font-size: 32px;
  width: 50px;
  text-align: center;
`;

const ScenarioBasicInfo = styled.div`
  flex: 1;
`;

const ScenarioName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 4px;
`;

const ScenarioTimeframe = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const ScenarioResult = styled.div`
  text-align: right;
  margin-right: 16px;
`;

const ResultValue = styled.div<{ $color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color};
  line-height: 1;
`;

const ResultImpact = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
`;

const ResultError = styled.div`
  color: #ef4444;
  font-weight: 600;
`;

const RiskBadge = styled.div<{ $risk: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => 
    props.$risk === 'High' ? '#fee2e2' :
    props.$risk === 'Medium' ? '#fef3c7' :
    props.$risk === 'Extreme' ? '#fecaca' : '#dcfce7'
  };
  color: ${props => 
    props.$risk === 'High' ? '#dc2626' :
    props.$risk === 'Medium' ? '#d97706' :
    props.$risk === 'Extreme' ? '#991b1b' : '#166534'
  };
`;

const ScenarioDetails = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  animation: ${fadeIn} 0.3s ease-out;
`;

const DetailDescription = styled.p`
  color: #4b5563;
  margin: 0 0 16px 0;
  line-height: 1.6;
`;

const DetailSectors = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
`;

const SectorTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SectorTag = styled.span`
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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
  color: #059669;
  font-size: 14px;
  font-weight: 500;
`;

const TooltipImpact = styled.div`
  color: #dc2626;
  font-size: 12px;
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