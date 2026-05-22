/* ----------------------------------= 
 * Persistence model for the data base
 * Purpose : relate backend variables to DB
*/

package com.slorentalregistry.backend;


import jakarta.persistence.*;

@Entity
@Table(name = "properties")
public class PropertyTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "property_id") // DB generated
    private Long property_id;

    private String address;
    private String city;
    private String zipcode;
    private Integer beds;
    private Integer baths;
    private Integer sqft;
    private String year_built;
    private String zoning;
    private String owner_email;
    private String owner_phone;

    // constructors
    public PropertyTable() {}
    public PropertyTable(PropertyDto dto) {
        this.address = dto.getPropAddress();
        this.city = dto.getPropCity();
        this.zipcode = dto.getPropZipcode();
        this.beds = dto.getPropNumBeds();
        this.baths = dto.getPropNumBaths();
        this.sqft = dto.getPropSqft();
        this.year_built = dto.getPropYearBuilt();
        this.zoning = dto.getPropZoning();
        this.owner_email = dto.getPropOwnerEmail();
        this.owner_phone = dto.getPropOwnerPhone();
    }

    // getters/setters (generate)
	public Long getPropID() { return property_id; }
    public void setPropID(Long property_id) { this.property_id = property_id; }
}

