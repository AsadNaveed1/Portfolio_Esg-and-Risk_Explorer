package com.esg.risk.backend.service;

import com.esg.risk.backend.model.Holding;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BreakdownService {

    /**
     * Group holdings by sector and sum their weights.
     */
    public Map<String, Double> sectorBreakdown(List<Holding> holdings) {
        Map<String, Double> result = new HashMap<>();
        for (Holding h : holdings) {
            result.merge(h.getSector(), h.getWeight(), Double::sum);
        }
        return result;
    }

    /**
     * Group holdings by region and sum their weights.
     */
    public Map<String, Double> regionBreakdown(List<Holding> holdings) {
        Map<String, Double> result = new HashMap<>();
        for (Holding h : holdings) {
            result.merge(h.getRegion(), h.getWeight(), Double::sum);
        }
        return result;
    }
}