package com.esg.risk.backend.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
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
    private final ESGService esgService;
    private final BreakdownService breakdownService;
    private final StressTestService stressTestService;

    public ReportService(
            HoldingRepository holdingRepository,
            MinioService minioService,
            ReportRepository reportRepository,
            ESGService esgService,
            BreakdownService breakdownService,
            StressTestService stressTestService) {
        this.holdingRepository = holdingRepository;
        this.minioService = minioService;
        this.reportRepository = reportRepository;
        this.esgService = esgService;
        this.breakdownService = breakdownService;
        this.stressTestService = stressTestService;
    }

    /**
     * Generate an XLSX report with comprehensive portfolio analysis
     */
    public Report generateXlsxReport(Long portfolioId) throws Exception {
        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolioId);
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            // Create styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // Sheet 1: Portfolio Summary
            Sheet summarySheet = workbook.createSheet("Portfolio Summary");
            createSummarySheet(summarySheet, holdings, headerStyle);
            
            // Sheet 2: Holdings Detail
            Sheet holdingsSheet = workbook.createSheet("Holdings");
            createHoldingsSheet(holdingsSheet, holdings, headerStyle);
            
            // Sheet 3: Sector Breakdown
            Sheet sectorSheet = workbook.createSheet("Sector Breakdown");
            createSectorBreakdownSheet(sectorSheet, holdings, headerStyle);
            
            // Sheet 4: Region Breakdown
            Sheet regionSheet = workbook.createSheet("Region Breakdown");
            createRegionBreakdownSheet(regionSheet, holdings, headerStyle);
            
            // Sheet 5: Stress Test Results
            Sheet stressSheet = workbook.createSheet("Stress Tests");
            createStressTestSheet(stressSheet, holdings, headerStyle);
            
            workbook.write(outputStream);
            byte[] data = outputStream.toByteArray();
            
            String objectName = String.format("reports/%d/report-%s.xlsx",
                    portfolioId, System.currentTimeMillis());

            try (ByteArrayInputStream in = new ByteArrayInputStream(data)) {
                minioService.uploadFile(objectName, in, data.length, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }

            Report report = new Report();
            report.setPortfolioId(portfolioId);
            report.setReportType("xlsx");
            report.setS3Path(objectName);
            report.setCreatedAt(LocalDateTime.now());
            return reportRepository.save(report);
        }
    }

    private void createSummarySheet(Sheet sheet, List<Holding> holdings, CellStyle headerStyle) {
        // ESG Score
        double esgScore = esgService.calculateEsg(holdings);
        
        Row row = sheet.createRow(0);
        Cell cell = row.createCell(0);
        cell.setCellValue("Portfolio Analysis Summary");
        cell.setCellStyle(headerStyle);
        
        row = sheet.createRow(2);
        row.createCell(0).setCellValue("ESG Score:");
        row.createCell(1).setCellValue(String.format("%.2f", esgScore));
        
        row = sheet.createRow(3);
        row.createCell(0).setCellValue("Total Holdings:");
        row.createCell(1).setCellValue(holdings.size());
        
        row = sheet.createRow(4);
        row.createCell(0).setCellValue("Total Weight:");
        row.createCell(1).setCellValue(String.format("%.2f%%", 
            holdings.stream().mapToDouble(Holding::getWeight).sum()));
        
        // Auto-size columns
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createHoldingsSheet(Sheet sheet, List<Holding> holdings, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Ticker", "Weight (%)", "Sector", "Region", "ESG Score"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        int rowNum = 1;
        for (Holding holding : holdings) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(holding.getTicker());
            row.createCell(1).setCellValue(holding.getWeight());
            row.createCell(2).setCellValue(holding.getSector());
            row.createCell(3).setCellValue(holding.getRegion());
            row.createCell(4).setCellValue(holding.getEsgScore());
        }
        
        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createSectorBreakdownSheet(Sheet sheet, List<Holding> holdings, CellStyle headerStyle) {
        Map<String, Double> sectorBreakdown = breakdownService.sectorBreakdown(holdings);
        
        Row headerRow = sheet.createRow(0);
        Cell cell = headerRow.createCell(0);
        cell.setCellValue("Sector Breakdown");
        cell.setCellStyle(headerStyle);
        
        headerRow = sheet.createRow(2);
        headerRow.createCell(0).setCellValue("Sector");
        headerRow.createCell(1).setCellValue("Weight (%)");
        headerRow.getCell(0).setCellStyle(headerStyle);
        headerRow.getCell(1).setCellStyle(headerStyle);
        
        int rowNum = 3;
        for (Map.Entry<String, Double> entry : sectorBreakdown.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(entry.getValue());
        }
        
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createRegionBreakdownSheet(Sheet sheet, List<Holding> holdings, CellStyle headerStyle) {
        Map<String, Double> regionBreakdown = breakdownService.regionBreakdown(holdings);
        
        Row headerRow = sheet.createRow(0);
        Cell cell = headerRow.createCell(0);
        cell.setCellValue("Region Breakdown");
        cell.setCellStyle(headerStyle);
        
        headerRow = sheet.createRow(2);
        headerRow.createCell(0).setCellValue("Region");
        headerRow.createCell(1).setCellValue("Weight (%)");
        headerRow.getCell(0).setCellStyle(headerStyle);
        headerRow.getCell(1).setCellStyle(headerStyle);
        
        int rowNum = 3;
        for (Map.Entry<String, Double> entry : regionBreakdown.entrySet()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(entry.getValue());
        }
        
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createStressTestSheet(Sheet sheet, List<Holding> holdings, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        Cell cell = headerRow.createCell(0);
        cell.setCellValue("Stress Test Results");
        cell.setCellStyle(headerStyle);
        
        headerRow = sheet.createRow(2);
        headerRow.createCell(0).setCellValue("Scenario");
        headerRow.createCell(1).setCellValue("Portfolio Value (%)");
        headerRow.createCell(2).setCellValue("Loss (%)");
        headerRow.getCell(0).setCellStyle(headerStyle);
        headerRow.getCell(1).setCellStyle(headerStyle);
        headerRow.getCell(2).setCellStyle(headerStyle);
        
        String[] scenarios = {"oil-shock", "climate-policy", "market-crash"};
        String[] scenarioNames = {"Oil Price Shock", "Climate Policy Impact", "Market Crash"};
        
        int rowNum = 3;
        for (int i = 0; i < scenarios.length; i++) {
            try {
                double result = stressTestService.runScenario(holdings, scenarios[i]);
                double portfolioValue = result;
                double loss = 100 - portfolioValue;
                
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(scenarioNames[i]);
                row.createCell(1).setCellValue(String.format("%.2f", portfolioValue));
                row.createCell(2).setCellValue(String.format("%.2f", loss));
            } catch (Exception e) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(scenarioNames[i]);
                row.createCell(1).setCellValue("Error");
                row.createCell(2).setCellValue("Error");
            }
        }
        
        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
        sheet.autoSizeColumn(2);
    }
}