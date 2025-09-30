// client/src/components/Dashboard.tsx
import { useState } from 'react';
import styled from 'styled-components';
import ESGView from './ESGView';
import BreakdownView from './BreakdownView';
import StressTestView from './StressTestView';
import type { DashboardTab } from '../types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('esg');

  const tabs: DashboardTab[] = [
    { id: 'esg', label: 'ESG Score', icon: '🌱' },
    { id: 'breakdown', label: 'Portfolio Breakdown', icon: '📊' },
    { id: 'stress', label: 'Stress Tests', icon: '⚡' }
  ];

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <Logo>
            <LogoIcon>PE</LogoIcon>
            <AppTitle>Portfolio ESG & Risk Explorer</AppTitle>
          </Logo>
          <PortfolioInfo>Portfolio ID: 1</PortfolioInfo>
        </HeaderContent>
      </Header>

      <Navigation>
        <NavContent>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              $active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <TabIcon>{tab.icon}</TabIcon>
              <TabLabel>{tab.label}</TabLabel>
            </TabButton>
          ))}
        </NavContent>
      </Navigation>

      <MainContent>
        <ContentCard>
          {activeTab === 'esg' && <ESGView portfolioId={1} />}
          {activeTab === 'breakdown' && <BreakdownView portfolioId={1} />}
          {activeTab === 'stress' && <StressTestView portfolioId={1} />}
        </ContentCard>
      </MainContent>
    </AppContainer>
  );
}

// Styled Components with Professional Design
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const AppTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const PortfolioInfo = styled.div`
  color: #718096;
  font-size: 14px;
  font-weight: 500;
`;

const Navigation = styled.nav`
  background: white;
  border-bottom: 1px solid #e2e8f0;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 8px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  font-weight: 500;
  
  ${props => props.$active ? `
    color: #667eea;
    border-bottom-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  ` : `
    color: #718096;
    &:hover {
      color: #4a5568;
      background: rgba(0, 0, 0, 0.02);
    }
  `}
`;

const TabIcon = styled.span`
  font-size: 18px;
`;

const TabLabel = styled.span`
  font-size: 15px;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  min-height: 600px;
  overflow: hidden;
`;