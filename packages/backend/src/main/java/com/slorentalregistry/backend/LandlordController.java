package com.slorentalregistry.backend;

import com.slorentalregistry.backend.properties.PropertyRegistrationService;
import com.slorentalregistry.backend.properties.PropertyRegistrationService.PropertyRegistrationRequest;
import com.slorentalregistry.backend.properties.PropertyRegistrationService.PropertyRegistrationResponse;
import java.sql.SQLException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.*;

@RestController
@RequestMapping("/api") // prefix addr
public class LandlordController
{
	/* ~~ temp backend storage ~~ */
	//private final List<PropertyDto> tempstore = new ArrayList<>();
	
	/* ~~ or send to backend instead ~~ */
	private final PropertyService service; 
	private final PropertyRegistrationService propertyRegistrationService;

	public LandlordController(
		PropertyService service,
		PropertyRegistrationService propertyRegistrationService
	){
		this.service = service;
		this.propertyRegistrationService = propertyRegistrationService;
	}

	/* ~~ post : landlord property ~~ */
    @PostMapping("/propertyreg")
    public ResponseEntity<?> registerProperty(
		@AuthenticationPrincipal Jwt jwt,
		@RequestBody PropertyDto property
	)
		throws SQLException
	{
		PropertyRegistrationResponse saved =
			propertyRegistrationService.createProperty(
				jwt,
				new PropertyRegistrationRequest(
					property.getPropID() == null ? null : property.getPropID().toString(),
					property.getPropAddress(),
					property.getPropCity(),
					property.getPropZipcode(),
					property.getPropZoning(),
					property.getPropNumBeds(),
					property.getPropNumBaths(),
					property.getPropSqft(),
					property.getPropYearBuilt(),
					property.getPropOwnerEmail(),
					property.getPropOwnerPhone()
				)
			);

		Map<String,Object> resp = new HashMap<>();
		resp.put("message", "Property registered");
		resp.put("id", saved.propertyId());
		resp.put("landlordId", saved.landlordId());

		return new ResponseEntity<>(resp, HttpStatus.CREATED);
	}

	/*
	// ~~ local storage (debug) ~~
	@GetMapping("/landlordpropreg")
	public List<PropertyDto> listProperties() {
		return tempstore;
	}
	*/

	// ~~ for database push ~~
	@GetMapping("/landlordpropreg")
	public List<PropertyTable> listProperties() {
		return service.listAll();
	}
}
