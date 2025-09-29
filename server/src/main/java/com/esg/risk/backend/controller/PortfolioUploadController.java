package com.esg.risk.backend.controller;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.esg.risk.backend.repository.PortfolioRepository;
import com.esg.risk.backend.repository.HoldingRepository;
import com.esg.risk.backend.model.Portfolio;
import com.esg.risk.backend.model.Holding;
import com.esg.risk.backend.service.MinioService;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioUploadController {

    private final PortfolioRepository portfolioRepo;
    private final HoldingRepository holdingRepo;
    private final MinioService minioService;

    public PortfolioUploadController(PortfolioRepository portfolioRepo,
            HoldingRepository holdingRepo,
            MinioService minioService) {
        this.portfolioRepo = portfolioRepo;
        this.holdingRepo = holdingRepo;
        this.minioService = minioService;
    }

    @PostMapping("/upload")
    public Portfolio uploadPortfolio(@RequestParam("file") MultipartFile file) throws Exception {

        String objectName = "portfolio/" + file.getOriginalFilename();
        InputStream stream = file.getInputStream();
        String s3Path = minioService.uploadFile(objectName, stream, file.getSize(), file.getContentType());

        Portfolio portfolio = new Portfolio();
        portfolio.setName(file.getOriginalFilename());
        portfolio.setS3Path(s3Path);
        portfolio.setUploadDate(LocalDate.now());
        portfolio = portfolioRepo.save(portfolio);

        List<Holding> holdings = parseCsv(file, portfolio);
        holdingRepo.saveAll(holdings);

        return portfolio;

    }

    private List<Holding> parseCsv(MultipartFile file, Portfolio portfolio) throws Exception {
        List<Holding> holdings = new ArrayList<>();
        // Very simple CSV parser (ticker, weight, sector, region, esgScore)
        try (InputStream inputStream = file.getInputStream()) {
            String content = new String(inputStream.readAllBytes());
            String[] lines = content.split("\\r?\\n");
            for (int i = 1; i < lines.length; i++) { // skip header
                String[] cols = lines[i].split(",");
                if (cols.length < 5) {
                    continue;
                }
                Holding h = new Holding();
                h.setPortfolio(portfolio);
                h.setTicker(cols[0]);
                h.setWeight(Double.parseDouble(cols[1]));
                h.setSector(cols[2]);
                h.setRegion(cols[3]);
                h.setEsgScore(Double.parseDouble(cols[4]));
                holdings.add(h);
            }
        }
        return holdings;

    }

}
