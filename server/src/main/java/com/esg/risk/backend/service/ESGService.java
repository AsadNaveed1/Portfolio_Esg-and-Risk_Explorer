package com.esg.risk.backend.service;

import com.esg.risk.backend.model.Holding;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ESGService {

    public double calculateEsg(List<Holding> holdings) {
        if (holdings == null || holdings.isEmpty()) {
            return 0.0;
        }
        double total = 0.0;
        double sumWeights = 0.0;
        for (Holding h : holdings) {
            total += h.getWeight() * h.getEsgScore();
            sumWeights += h.getWeight();
        }
        return total / sumWeights;
    }
}