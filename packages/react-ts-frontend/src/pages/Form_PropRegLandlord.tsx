import { useState } from 'react' 
import styles from "./PropertyForm.module.css"
import { readCookie } from '../utils/cookies'

/* ~~~~ data types ~~~~ */
type PropertyFormState = {
	//propID:			number,
	propAddress:	string,
	propCity:		string,
	propZipcode:	string,
	propNumBeds:	number,
	propNumBaths:	number,
	propSqft:		number,
	propYearBuilt:	string,
	propZoning:		string,
	propOwnerEmail:	string,
	propOwnerPhone:	string
};

/* ~~~~ default values ~~~~ */
const initialState: PropertyFormState = 
{
	//propID:				-1,
	propAddress:		"",
	propCity:			"",
	propZipcode:		"",
	propNumBeds:		0, 
	propNumBaths:		0, 
	propSqft:			0,
	propYearBuilt:		"",
	propZoning:			"",
	propOwnerEmail:		"",
	propOwnerPhone:		""
}

export default function PropertyRegisterLL() {
	
	const [form, setForm] = useState<PropertyFormState>(initialState);
	const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormState, string>>>({});

	/* ~~ handle input changes and type the event as HTML input ~~ */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value, type} = e.target; 
		const key = name as keyof PropertyFormState;

		/* convert raw string to number if needed or keep blank if blank*/
		const parsed = type === "number" ? (value === "" ? "" : Number(value)) : value; 

		/* update the form state w/ new key and parsed */
		setForm(prev => ({ ...prev, [key]: parsed as PropertyFormState[typeof key] }));

		/* clear pre-existing errors from fields */
		setErrors(prev => ({ ...prev, [key]: undefined }));
	};

	/* ~~ Ensure required data is entered in correct range ~~ */
	const validate = (data: PropertyFormState) => {
		const err: typeof errors = {};

		/* empty address */
		if(!data.propAddress.trim()) {
			err.propAddress = "Address is required";
		}

		/* empty city */
		if(!data.propCity.trim()) {
			err.propCity = "City is required";
		}

		/* empty zip */
		if(!data.propZipcode.trim()) {
			err.propZipcode = "Zipcode is required";
		}

		/* invalid integer values */
		if(!Number.isInteger(data.propNumBeds) || data.propNumBeds < 0) {
			err.propNumBeds = "Invalid number of beds.";
		}
		if(!Number.isInteger(data.propNumBaths) || data.propNumBaths < 0) {

			err.propNumBaths = "Invalid number of baths.";
		}

		return err;
	}


	const handleSubmit = async (e: React.FormEvent) => {

		/* prevent browsers default submission-and-reload behavior */
		e.preventDefault();

		/* collect errors found in validate() */
		const v = validate(form);

		/* show errors and exit if errors found */
		if(Object.keys(v).length) { setErrors(v); return; }

		/* POST : send data to backend */
		try {

			/* ensure the correct datatypes are passed */
			const payload = {
				...form, 
				propNumBeds: 	Number(form.propNumBeds), 
				propNumBaths:	Number(form.propNumBaths),
				propSqft:		Number(form.propSqft),
			};

			const res = await fetch(
				"http://localhost:8080/api/propertyreg",
				{
					method: "POST",
					credentials: "include",							//send session and csrf cookie
					headers: {
						"Content-Type":"application/json",
						//...(xsrf ? {'X-XSRF-TOKEN' : decodeURIComponent(xsrf) } : {} ) // decode that cookie
						"X-XSRF-TOKEN": readCookie('XSRF-TOKEN') || ''
					},
					body: JSON.stringify(payload)
				}
			);

			if(!res.ok)
			{
				throw new Error(`Server error: ${res.status}`);
			}

			console.log("Property submitted:", form);
			alert("Submitted!");

			/* clear form */
			setForm(initialState);
		}
		catch (err) {
			console.error(err); 
			alert("Submission failed");
		}
	};

	return(
		<form className={styles.form} onSubmit={handleSubmit} noValidate>
			<h2 className={styles.title}> Property Details </h2>

				<div className={styles.field}>
					<label className={styles.label} htmlFor="propAddress">Address*</label>
						<input
							name= "propAddress"
							id= "propAddress"
							type = "text"
							className = {styles.input}
							value={form.propAddress}
							placeholder= "123 Grand Avenue"
							onChange={handleChange}
							required
						/>
						{
							errors.propAddress && 
							<div className={styles.error}>
								{errors.propAddress}
							</div>
						}
				</div>

				<div className={styles.field}>
					<label className={styles.label} htmlFor="propCity">City*</label>
						<input
							name= "propCity"
							id= "propCity"
							type = "text"
							className = {styles.input}
							value={form.propCity}
							placeholder= "San Luis Obispo"
							onChange={handleChange}
							required
						/>
						{
							errors.propCity && 
							<div className={styles.error}>
								{errors.propCity}
							</div>
						}
				</div>

				<div className={styles.field}>
					<label className={styles.label} htmlFor="propZipcode">Zipcode*</label>
						<input
							name= "propZipcode"
							id= "propZipcode"
							type = "text"
							className = {styles.input}
							value={form.propZipcode}
							placeholder= "93401"
							onChange={handleChange}
							required
						/>
						{
							errors.propZipcode && 
							<div className={styles.error}>
								{errors.propZipcode}
							</div>
						}
				</div>

				<div className={styles.row}>
					<label className={styles.fieldSmall} htmlFor="propNumBeds">Beds*</label>
						<input
							name= "propNumBeds"
							id= "propNumBeds"
							type = "number"
							min={0}
							step={1}
							className = {styles.input}
							value={String(form.propNumBeds)}
							placeholder= "0"
							onChange={handleChange}
							required
						/>
						{
							errors.propNumBeds && 
							<div className={styles.error}>
								{errors.propNumBeds}
							</div>
						}
				</div>

				<div className={styles.row}>
					<label className={styles.fieldSmall} htmlFor="propNumBaths">Baths*</label>
						<input
							name= "propNumBaths"
							id= "propNumBaths"
							type = "number"
							min={0}
							step={1}
							className = {styles.input}
							value={String(form.propNumBaths)}
							placeholder= "0"
							onChange={handleChange}
							required
						/>
						{
							errors.propNumBaths && 
							<div className={styles.error}>
								{errors.propNumBaths}
							</div>
						}
				</div>

				<div className={styles.row}>
					<label className={styles.fieldSmall} htmlFor="propSqft">Sqft</label>
						<input
							name= "propSqft"
							id= "propSqft"
							type = "number"
							min={0}
							step={1}
							className = {styles.input}
							value={String(form.propSqft)}
							placeholder= "0"
							onChange={handleChange}
						/>
						{
							errors.propSqft && 
							<div className={styles.error}>
								{errors.propSqft}
							</div>
						}
				</div>

				<div className={styles.row}>
					<label className={styles.fieldSmall} htmlFor="propYearBuilt">Year Built</label>
						<input
							name= "propYearBuilt"
							id= "propYearBuilt"
							type = "text"
							className = {styles.input}
							value={String(form.propYearBuilt)}
							placeholder= "1900"
							onChange={handleChange}
						/>
						{
							errors.propYearBuilt && 
							<div className={styles.error}>
								{errors.propYearBuilt}
							</div>
						}
				</div>

				<div className={styles.field}>
					<label className={styles.label} htmlFor="propZoning">Zoning</label>
						<input
							name= "propZoning"
							id= "propZoning"
							type = "text"
							className = {styles.input}
							value={form.propZoning}
							placeholder= "Residential"
							onChange={handleChange}
						/>
						{
							errors.propZoning && 
							<div className={styles.error}>
								{errors.propZoning}
							</div>
						}
				</div>

				<div className={styles.field}>
					<label className={styles.label} htmlFor="propOwnerEmail">Owner's Email</label>
						<input
							name= "propOwnerEmail"
							id= "propOwnerEmail"
							type = "text"
							className = {styles.input}
							value={form.propOwnerEmail}
							placeholder= "owner@email.com"
							onChange={handleChange}
						/>
						{
							errors.propOwnerEmail && 
							<div className={styles.error}>
								{errors.propOwnerEmail}
							</div>
						}
				</div>

				<div className={styles.field}>
					<label className={styles.label} htmlFor="propOwnerPhone">Owner's Phone</label>
						<input
							name= "propOwnerPhone"
							id= "propOwnerPhone"
							type = "text"
							className = {styles.input}
							value={form.propOwnerPhone}
							placeholder= "000-000-0000"
							onChange={handleChange}
						/>
						{
							errors.propOwnerPhone && 
							<div className={styles.error}>
								{errors.propOwnerPhone}
							</div>
						}
				</div>

				<button type='submit' className={styles.button}>
					Save Property
				</button>

		</form>
	);
}


