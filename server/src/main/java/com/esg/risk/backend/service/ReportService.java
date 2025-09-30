package com.esg.risk.backend.service;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.model.Report;
import com.esg.risk.backend.repository.HoldingRepository;
import com.esg.risk.backend.repository.ReportRepository;

@Service
public class ReportService {

    private final HoldingRepository holdingRepository;
    private final MinioService minioService;
    private final ReportRepository reportRepository;

    public ReportService(
            HoldingRepository holdingRepository,
            MinioService minioService,
            ReportRepository reportRepository) {
        this.holdingRepository = holdingRepository;
        this.minioService = minioService;
        this.reportRepository = reportRepository;
    }

    /**
     * Generate a CSV report for portfolio holdings
     */
    public Report generateCsvReport(Long portfolioId) throws Exception {
        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolioId);

        StringBuilder sb = new StringBuilder();
        sb.append("Ticker,Weight,Sector,Region,ESG\n");
        for (Holding h : holdings) {
            sb.append(h.getTicker()).append(",")
              .append(h.getWeight()).append(",")
              .append(h.getSector()).append(",")
              .append(h.getRegion()).append(",")
              .append(h.getEsgScore()).append("\n");
        }

        byte[] data = sb.toString().getBytes();
        String objectName = String.format("reports/%d/report-%s.csv",
                portfolioId, System.currentTimeMillis());

        try (ByteArrayInputStream in = new ByteArrayInputStream(data)) {
            minioService.uploadFile(objectName, in, data.length, "text/csv");
        }

        Report report = new Report();
        report.setPortfolioId(portfolioId);
        report.setReportType("csv");
        report.setS3Path(objectName);
        report.setCreatedAt(LocalDateTime.now());
        return reportRepository.save(report);
    }
}