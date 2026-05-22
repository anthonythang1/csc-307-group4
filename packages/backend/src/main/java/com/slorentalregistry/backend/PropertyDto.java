package com.slorentalregistry.backend;

/* PropertiesDto
 * Purpose : create class for BE data with getters/setters
 *
 *
 */


public class PropertyDto 
{
	private Long 	propID;
	private String 	propAddress;
	private String 	propCity;
	private String 	propZipcode;
	private Integer	propNumBeds;
	private Integer	propNumBaths;
	private Integer	propSqft;
	private String 	propYearBuilt;
	private String 	propZoning;
	private String 	propOwnerEmail;
	private String 	propOwnerPhone;

	
	public PropertyDto() {}
	public PropertyDto(
						Long	propID, 
						String	propAddress,
		   				String	propCity, 
						String	propZipcode,
                       	Integer	propNumBeds, 
						Integer	propNumBaths, 
						Integer	propSqft,
                       	String 	propYearBuilt, 
						String 	propZoning,
                       	String 	propOwnerEmail, 
						String 	propOwnerPhone) 
	{
		this.propID = 			propID;
		this.propAddress = 		propAddress;
		this.propCity = 		propCity;
		this.propZipcode = 		propZipcode;
		this.propNumBeds = 		propNumBeds;
		this.propNumBaths = 	propNumBaths;
		this.propSqft = 		propSqft;
		this.propYearBuilt = 	propYearBuilt;
		this.propZoning = 		propZoning;
		this.propOwnerEmail = 	propOwnerEmail;
		this.propOwnerPhone = 	propOwnerPhone;
    }
	

    // Getters and setters
    public Long getPropID() { return propID; }
    public void setPropID(Long propID) { this.propID = propID; }

    public String getPropAddress() { return propAddress; }
    public void setPropAddress(String propAddress) { this.propAddress = propAddress; }

    public String getPropCity() { return propCity; }
    public void setPropCity(String propCity) { this.propCity = propCity; }

    public String getPropZipcode() { return propZipcode; }
    public void setPropZipcode(String propZipcode) { this.propZipcode = propZipcode; }

    public Integer getPropNumBeds() { return propNumBeds; }
    public void setPropNumBeds(Integer propNumBeds) { this.propNumBeds = propNumBeds; }

    public Integer getPropNumBaths() { return propNumBaths; }
    public void setPropNumBaths(Integer propNumBaths) { this.propNumBaths = propNumBaths; }

    public Integer getPropSqft() { return propSqft; }
    public void setPropSqft(Integer propSqft) { this.propSqft = propSqft; }

    public String getPropYearBuilt() { return propYearBuilt; }
    public void setPropYearBuilt(String propYearBuilt) { this.propYearBuilt = propYearBuilt; }

    public String getPropZoning() { return propZoning; }
    public void setPropZoning(String propZoning) { this.propZoning = propZoning; }

    public String getPropOwnerEmail() { return propOwnerEmail; }
    public void setPropOwnerEmail(String propOwnerEmail) { this.propOwnerEmail = propOwnerEmail; }

    public String getPropOwnerPhone() { return propOwnerPhone; }
    public void setPropOwnerPhone(String propOwnerPhone) { this.propOwnerPhone = propOwnerPhone; }
}

