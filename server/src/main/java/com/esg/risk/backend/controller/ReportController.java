package com.esg.risk.backend.controller;

import com.esg.risk.backend.model.Report;
import com.esg.risk.backend.repository.ReportRepository;
import com.esg.risk.backend.service.ReportService;
import com.esg.risk.backend.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private MinioService minioService;

    /**
     * Generate XLSX report
     * Example: POST /api/portfolios/1/report/xlsx
     */
    @PostMapping("/{id}/report/xlsx")
    public Report generateXlsx(@PathVariable Long id) throws Exception {
        return reportService.generateXlsxReport(id);
    }

    /**
     * List all reports for a portfolio
     * Example: GET /api/portfolios/1/reports
     */
    @GetMapping("/{id}/reports")
    public List<Report> listReports(@PathVariable Long id) {
        return reportRepository.findByPortfolioId(id);
    }

    /**
     * Download a specific report by ID
     * Example: GET /api/portfolios/reports/42/download
     */
    @GetMapping("/reports/{reportId}/download")
    public ResponseEntity<byte[]> downloadReport(@PathVariable Long reportId) throws Exception {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        try (InputStream in = minioService.getFile(report.getS3Path())) {
            byte[] content = in.readAllBytes();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=portfolio-report.xlsx")
                    .header(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(content);
        }
    }
}