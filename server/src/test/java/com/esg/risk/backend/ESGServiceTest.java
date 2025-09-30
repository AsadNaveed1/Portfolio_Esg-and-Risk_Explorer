package com.esg.risk.backend;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.model.Portfolio;
import com.esg.risk.backend.service.ESGService;

import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ESGServiceTest {

    @Test
    void testCalculateWeightedEsgScore() {
        // given: a portfolio with 2 holdings
        Portfolio p = new Portfolio();
        Holding h1 = new Holding();
        h1.setWeight(0.5);
        h1.setEsgScore(80.0);
        h1.setPortfolio(p);

        Holding h2 = new Holding();
        h2.setWeight(0.5);
        h2.setEsgScore(60.0);
        h2.setPortfolio(p);

        ESGService service = new ESGService();

        double score = service.calculateEsg(Arrays.asList(h1, h2));

        assertEquals(70.0, score);
    }
}