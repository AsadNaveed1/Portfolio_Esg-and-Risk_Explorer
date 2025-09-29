package com.esg.risk.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Setter;
import lombok.Getter;

@Getter
@Setter
@Entity
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary key

    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;  // Links holding to portfolio

    private String ticker;   // e.g. AAPL, TSLA
    private Double weight;   // % of portfolio
    private String sector;   // e.g. Tech, Energy
    private String region;   // e.g. US, EU
    private Double esgScore; // ESG score value


}
