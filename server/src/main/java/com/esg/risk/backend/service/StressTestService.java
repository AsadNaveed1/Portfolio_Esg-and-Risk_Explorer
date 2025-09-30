package com.esg.risk.backend.service;

import com.esg.risk.backend.model.Holding;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StressTestService {

    /**
     * Run a named stress test scenario.
     *
     * @param holdings portfolio holdings
     * @param scenario scenario name ("oil-shock", "climate-policy", "market-crash")
     * @return new portfolio value (1.0 = 100%)
     */
    public double runScenario(List<Holding> holdings, String scenario) {
        switch (scenario.toLowerCase()) {
            case "oil-shock":
                return applyOilShock(holdings);
            case "climate-policy":
                return applyClimatePolicyShock(holdings);
            case "market-crash":
                return applyMarketCrash(holdings);
            default:
                throw new IllegalArgumentException("Unknown scenario: " + scenario);
        }
    }

    /**
     * Oil Shock scenario:
     * Cut Energy weights by 50%
     */
    private double applyOilShock(List<Holding> holdings) {
        double total = 0.0;
        for (Holding h : holdings) {
            double adjustedWeight = h.getWeight();
            if ("Energy".equalsIgnoreCase(h.getSector())) {
                adjustedWeight *= 0.5;
            }
            total += adjustedWeight;
        }
        return total;
    }

    /**
     * Climate Policy scenario:
     * Penalize "Utilities" and "Energy" (−40%),
     * Reward "Renewables" (+20%),
     */
    private double applyClimatePolicyShock(List<Holding> holdings) {
        double total = 0.0;
        for (Holding h : holdings) {
            double adjustedWeight = h.getWeight();
            String sector = h.getSector() == null ? "" : h.getSector();

            if ("Energy".equalsIgnoreCase(sector) || "Utilities".equalsIgnoreCase(sector)) {
                adjustedWeight *= 0.6;
            }
            if ("Renewables".equalsIgnoreCase(sector)) {
                adjustedWeight *= 1.2;
            }

            total += adjustedWeight;
        }
        return total;
    }

    /**
     * Market Crash scenario:
     * Reduce all holdings by 30%
     */
    private double applyMarketCrash(List<Holding> holdings) {
        return holdings.stream()
                .mapToDouble(h -> h.getWeight() * 0.7)
                .sum();
    }
}