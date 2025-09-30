package com.esg.risk.backend.controller;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.repository.HoldingRepository;
import com.esg.risk.backend.service.ESGService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
public class ESGController {

    @Autowired
    private HoldingRepository holdingRepository;
    @Autowired
    private ESGService esgService;

    @GetMapping("/{id}/esg")
    public double getEsgScore(@PathVariable Long id) {
        List<Holding> holdings = holdingRepository.findByPortfolioId(id);
        return esgService.calculateEsg(holdings);
    }
}