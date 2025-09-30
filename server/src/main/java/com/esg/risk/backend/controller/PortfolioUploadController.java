package com.esg.risk.backend.controller;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.model.Portfolio;
import com.esg.risk.backend.repository.HoldingRepository;
import com.esg.risk.backend.repository.PortfolioRepository;
import com.esg.risk.backend.service.MinioService;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = {"http://localhost", "http://localhost:80", "http://localhost:5173"})
public class PortfolioUploadController {

    @Autowired
    private PortfolioRepository portfolioRepo;
    @Autowired
    private HoldingRepository holdingRepo;
    @Autowired
    private MinioService minioService;

    @PostMapping("/upload")
    public Portfolio uploadPortfolio(@RequestParam("file") MultipartFile file) throws Exception {
        System.out.println("Received file: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Content type: " + file.getContentType());

        String fileName = file.getOriginalFilename().toLowerCase();
        if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
            throw new IllegalArgumentException("Only Excel files (.xlsx, .xls) are supported. Please upload an Excel file.");
        }

        String objectName = "portfolio/" + file.getOriginalFilename();
        InputStream stream = file.getInputStream();
        String s3Path = minioService.uploadFile(objectName, stream, file.getSize(), file.getContentType());

        Portfolio portfolio = new Portfolio();
        portfolio.setName(file.getOriginalFilename());
        portfolio.setS3Path(s3Path);
        portfolio.setUploadDate(LocalDate.now());
        Portfolio savedPortfolio = portfolioRepo.save(portfolio);
        System.out.println("Saved portfolio with ID: " + savedPortfolio.getId());

        List<Holding> holdings = parseExcel(file, savedPortfolio);
        System.out.println("Parsed " + holdings.size() + " holdings");
        
        holdingRepo.saveAll(holdings);
        System.out.println("Saved all holdings to database");

        return savedPortfolio;
    }

    private List<Holding> parseExcel(MultipartFile file, Portfolio portfolio) throws Exception {
        List<Holding> holdings = new ArrayList<>();
        
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            System.out.println("Sheet name: " + sheet.getSheetName());
            System.out.println("Total rows: " + sheet.getPhysicalNumberOfRows());
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    System.out.println("Skipping null row " + i);
                    continue;
                }
                
                if (row.getPhysicalNumberOfCells() < 5) {
                    System.out.println("Skipping row " + i + " - insufficient cells: " + row.getPhysicalNumberOfCells());
                    continue;
                }
                
                try {
                    Holding h = new Holding();
                    h.setPortfolio(portfolio);
                    
                    h.setTicker(row.getCell(0).getStringCellValue().trim());
                    h.setWeight(row.getCell(1).getNumericCellValue() * 100);
                    h.setSector(row.getCell(2).getStringCellValue().trim());
                    h.setRegion(row.getCell(3).getStringCellValue().trim());
                    h.setEsgScore(row.getCell(4).getNumericCellValue());
                    
                    holdings.add(h);
                    System.out.println("✓ Added holding: " + h.getTicker() + 
                        " | Weight: " + String.format("%.1f", h.getWeight()) + "%" +
                        " | Sector: " + h.getSector() + 
                        " | Region: " + h.getRegion() + 
                        " | ESG: " + h.getEsgScore());
                    
                } catch (Exception e) {
                    System.err.println("Error parsing row " + i + ": " + e.getMessage());
                }
            }
        }
        
        System.out.println("Successfully parsed " + holdings.size() + " holdings from Excel");
        return holdings;
    }
}