package com.esg.risk.backend.repository;

import com.esg.risk.backend.model.Holding;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HoldingRepository extends JpaRepository<Holding, Long> {

    List<Holding> findByPortfolioId(Long id);}