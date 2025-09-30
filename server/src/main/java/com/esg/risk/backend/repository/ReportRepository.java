package com.esg.risk.backend.repository;

import com.esg.risk.backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByPortfolioId(Long portfolioId);
}