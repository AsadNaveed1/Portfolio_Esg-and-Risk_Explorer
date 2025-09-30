package com.esg.risk.backend;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.model.Portfolio;
import com.esg.risk.backend.service.StressTestService;

class StressTestServiceTest {

    private final StressTestService service = new StressTestService();

    @Test
    void testOilShock() {
        Portfolio p = new Portfolio();

        Holding h1 = new Holding();
        h1.setPortfolio(p);
        h1.setSector("Tech");
        h1.setWeight(0.6);

        Holding h2 = new Holding();
        h2.setPortfolio(p);
        h2.setSector("Energy");
        h2.setWeight(0.4);

        double result = service.runScenario(Arrays.asList(h1, h2), "oil-shock");
        assertEquals(0.8, result, 0.01);
    }

    @Test
    void testClimatePolicyShock() {
        Portfolio p = new Portfolio();

        Holding h1 = new Holding();
        h1.setPortfolio(p);
        h1.setSector("Renewables");
        h1.setWeight(0.5);

        Holding h2 = new Holding();
        h2.setPortfolio(p);
        h2.setSector("Energy");
        h2.setWeight(0.5);

        double result = service.runScenario(Arrays.asList(h1, h2), "climate-policy");
        // Renewables +20% = 0.6, Energy -40% = 0.3 → total = 0.9
        assertEquals(0.9, result, 0.01);
    }

    @Test
    void testMarketCrash() {
        Portfolio p = new Portfolio();

        Holding h1 = new Holding();
        h1.setPortfolio(p);
        h1.setWeight(0.5);

        Holding h2 = new Holding();
        h2.setPortfolio(p);
        h2.setWeight(0.5);

        double result = service.runScenario(Arrays.asList(h1, h2), "market-crash");
        // All reduced by 30%, so total = 0.7
        assertEquals(0.7, result, 0.01);
    }
}