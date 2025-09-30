package com.esg.risk.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.repository.HoldingRepository;
import com.esg.risk.backend.service.BreakdownService;

@RestController
@RequestMapping("/api/portfolios")
public class BreakdownController {

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private BreakdownService breakdownService;

    @GetMapping("/{id}/breakdown/sector")
    public Map<String, Double> getSectorBreakdown(@PathVariable Long id) {
        List<Holding> holdings = holdingRepository.findByPortfolioId(id);
        return breakdownService.sectorBreakdown(holdings);
    }

    @GetMapping("/{id}/breakdown/region")
    public Map<String, Double> getRegionBreakdown(@PathVariable Long id) {
        List<Holding> holdings = holdingRepository.findByPortfolioId(id);
        return breakdownService.regionBreakdown(holdings);
    }
}