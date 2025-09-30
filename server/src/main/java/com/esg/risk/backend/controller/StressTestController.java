package com.esg.risk.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.repository.HoldingRepository;
import com.esg.risk.backend.service.StressTestService;

@RestController
@RequestMapping("/api/portfolios")
public class StressTestController {
    
    @Autowired
    private HoldingRepository holdingRepository;
    @Autowired
    private StressTestService stressTestService;


    /**
     * Run stress test scenario
     * Example: GET /api/portfolios/1/stress/oil-shock
     */
    @GetMapping("/{id}/stress/{scenario}")
    public double applyScenario(@PathVariable Long id, @PathVariable String scenario) {
        List<Holding> holdings = holdingRepository.findByPortfolioId(id);
        return stressTestService.runScenario(holdings, scenario);
    }
}