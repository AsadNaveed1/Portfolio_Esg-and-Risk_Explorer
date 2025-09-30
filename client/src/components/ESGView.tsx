import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import api from "../api";
import type { ESGViewProps, ESGComponent } from "../types";

export default function ESGView({ portfolioId }: ESGViewProps) {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchESGScore = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/${portfolioId}/esg`);
        setScore(response.data);
      } catch (err) {
        console.error("Failed to fetch ESG score", err);
        setError("Failed to load ESG data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchESGScore();
  }, [portfolioId]);

  const createESGBreakdown = (totalScore: number): ESGComponent[] => {
    return [
      { name: 'Environmental', value: totalScore * 0.35, fullMark: 100, color: '#10B981' },
      { name: 'Social', value: totalScore * 0.30, fullMark: 100, color: '#3B82F6' },
      { name: 'Governance', value: totalScore * 0.35, fullMark: 100, color: '#8B5CF6' },
    ];
  };

  const getScoreColor = (scoreValue: number): string => {
    if (scoreValue >= 80) return '#10B981';
    if (scoreValue >= 60) return '#F59E0B';
    if (scoreValue >= 40) return '#EF4444';
    return '#6B7280';
  };

  const getScoreLabel = (scoreValue: number): string => {
    if (scoreValue >= 80) return 'Excellent';
    if (scoreValue >= 60) return 'Good';
    if (scoreValue >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>Loading ESG analysis...</LoadingText>
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
            Try Again
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  if (score === null) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorText>No ESG data available</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  const esgBreakdown = createESGBreakdown(score);
  const scoreColor = getScoreColor(score);

  return (
    <Container>
      <Header>
        <HeaderTitle>ESG Score Analysis</HeaderTitle>
        <HeaderSubtitle>Environmental, Social & Governance Performance</HeaderSubtitle>
      </Header>

      <ContentGrid>
        <ScoreSection>
          <ScoreCard>
            <ScoreValue $color={scoreColor}>
              {score.toFixed(1)}
            </ScoreValue>
            <ScoreLabel $color={scoreColor}>
              {getScoreLabel(score)}
            </ScoreLabel>
            <ScoreSubtext>Out of 100</ScoreSubtext>
          </ScoreCard>

          <ProgressBar>
            <ProgressFill $width={(score / 100) * 100} $color={scoreColor} />
          </ProgressBar>
        </ScoreSection>

        <ChartSection>
          <SectionTitle>ESG Component Breakdown</SectionTitle>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={esgBreakdown}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Radar
                  name="ESG Score"
                  dataKey="value"
                  stroke="#667eea"
                  fill="rgba(102, 126, 234, 0.3)"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartSection>

        <ComponentsSection>
          <SectionTitle>Individual Components</SectionTitle>
          <ComponentsList>
            {esgBreakdown.map((component, index) => (
              <ComponentCard key={index}>
                <ComponentHeader>
                  <ComponentIcon $backgroundColor={component.color}>
                    {component.name[0]}
                  </ComponentIcon>
                  <ComponentName>{component.name}</ComponentName>
                </ComponentHeader>
                <ComponentScore $color={component.color}>
                  {component.value.toFixed(1)}
                </ComponentScore>
                <ComponentBar>
                  <ComponentProgress 
                    $width={(component.value / 100) * 100} 
                    $color={component.color} 
                  />
                </ComponentBar>
              </ComponentCard>
            ))}
          </ComponentsList>
        </ComponentsSection>
      </ContentGrid>
    </Container>
  );
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  padding: 32px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ScoreSection = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
`;

const ScoreCard = styled.div`
  text-align: center;
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 200px;
`;

const ScoreValue = styled.div<{ $color: string }>`
  font-size: 4rem;
  font-weight: 800;
  color: ${props => props.$color};
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ScoreLabel = styled.div<{ $color: string }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.$color};
  margin-bottom: 4px;
`;

const ScoreSubtext = styled.div`
  font-size: 14px;
  color: #64748b;
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: linear-gradient(90deg, ${props => props.$color}, ${props => props.$color}dd);
  border-radius: 6px;
  transition: width 1s ease-out;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const ChartSection = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
`;

const ComponentsSection = styled.div`
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 20px 0;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
`;

const ComponentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ComponentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
`;

const ComponentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ComponentIcon = styled.div<{ $backgroundColor: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  background-color: ${props => props.$backgroundColor};
`;

const ComponentName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
`;

const ComponentScore = styled.div<{ $color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color};
  margin-bottom: 8px;
`;

const ComponentBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const ComponentProgress = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  border-radius: 3px;
  transition: width 1s ease-out;
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