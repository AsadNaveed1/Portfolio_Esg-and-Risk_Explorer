package com.esg.risk.backend;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.model.Portfolio;
import com.esg.risk.backend.service.BreakdownService;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BreakdownServiceTest {

    @Test
    void testSectorBreakdown() {
        Portfolio p = new Portfolio();

        Holding h1 = new Holding();
        h1.setPortfolio(p);
        h1.setSector("Tech");
        h1.setWeight(0.6);

        Holding h2 = new Holding();
        h2.setPortfolio(p);
        h2.setSector("Energy");
        h2.setWeight(0.3);

        Holding h3 = new Holding();
        h3.setPortfolio(p);
        h3.setSector("Tech");
        h3.setWeight(0.1);

        BreakdownService service = new BreakdownService();
        Map<String, Double> breakdown = service.sectorBreakdown(Arrays.asList(h1, h2, h3));

        assertEquals(0.7, breakdown.get("Tech"), 0.01);
        assertEquals(0.3, breakdown.get("Energy"), 0.01);
        assertEquals(2, breakdown.size());
    }

    @Test
    void testRegionBreakdown() {
        Portfolio p = new Portfolio();

        Holding h1 = new Holding();
        h1.setPortfolio(p);
        h1.setRegion("US");
        h1.setWeight(0.5);

        Holding h2 = new Holding();
        h2.setPortfolio(p);
        h2.setRegion("EU");
        h2.setWeight(0.25);

        Holding h3 = new Holding();
        h3.setPortfolio(p);
        h3.setRegion("US");
        h3.setWeight(0.25);

        BreakdownService service = new BreakdownService();
        Map<String, Double> breakdown = service.regionBreakdown(Arrays.asList(h1, h2, h3));

        assertEquals(0.75, breakdown.get("US"), 0.01);
        assertEquals(0.25, breakdown.get("EU"), 0.01);
        assertEquals(2, breakdown.size());
    }
}