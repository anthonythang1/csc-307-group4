package com.slorentalregistry.backend;

/* PropertyRepository.java
 * Purpose : Gives us a java interface to talk to the DB for PropertyTable
 */

import org.springframework.data.jpa.repository.JpaRepository;
public interface PropertyRepository extends JpaRepository<PropertyTable, Long> {}

