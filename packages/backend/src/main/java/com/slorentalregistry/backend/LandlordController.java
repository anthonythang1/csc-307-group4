package com.slorentalregistry.backend;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.*;

@RestController
@RequestMapping("/api") // prefix addr
public class LandlordController
{
	/* ~~ temp backend storage ~~ */
	//private final List<PropertyDto> tempstore = new ArrayList<>();
	
	/* ~~ or send to backend instead ~~ */
	private final PropertyService service; 
	public LandlordController(PropertyService service){
		this.service = service;
	}

	/* ~~ post : landlord property ~~ */
    @PostMapping("/propertyreg")
    public ResponseEntity<?> registerProperty(@RequestBody PropertyDto property)
	{
		// ~ local storage (debug) ~
		//tempstore.add(property);
		
		PropertyTable saved = service.saveFromDto(property);

		Map<String,Object> resp = new HashMap<>();
		resp.put("message", "Property registered");
		resp.put("id", saved.getPropID());

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

