package com.esg.risk.backend.repository;

import com.esg.risk.backend.model.Holding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HoldingRepository extends JpaRepository<Holding, Long> {}