package com.slorentalregistry.backend;

import org.springframework.stereotype.Service;
import java.util.List;

/* Purpose : keep DB logic out of controllers (BE) */

@Service
public class PropertyService {

	
    private final PropertyRepository repo;
    public PropertyService(PropertyRepository repo) { this.repo = repo; }

	/* ~~~~ convert BE entity to DB entity, saving to DB ~~~~ */
    public PropertyTable saveFromDto(PropertyDto dto) {
        PropertyTable p = new PropertyTable(dto); 
        return repo.save(p);
    }

    public List<PropertyTable> listAll() { return repo.findAll(); }
}

