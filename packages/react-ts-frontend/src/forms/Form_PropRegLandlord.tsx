import { useState } from 'react' 
import { useForm } from "../hooks/useForm.tsx";
import { FormContainer, FieldRow, Field } from "./FormContainer.tsx"
import styles from "./Form.module.css"

// TODO CEW : these are not all strings
interface PropertyValues
{
	propID:			string,
	propAddress:	string,
	propZoning:		string,
	propNumBeds:	string,
	propNumBaths:	string,
	propSqft:		string,
	propYearBuilt:	string
}

// defining the initial state of our form (all blank)
const initialState: PropertyValues = 
{
	propID:				"",
	propAddress:		"",
	propZoning:			"",
	propNumBeds:		"", 
	propNumBaths:		"", 
	propSqft:			"",
	propYearBuilt:		"",
	//propOwnerFname:		"",
	//propOwnerLname:		"",
	//propOwnerPhoneNum:	"",
	//propOwnerEmail:		""
}

export default function PropertyRegForm_Landlord()
{
	// getting the event handlers from our custom hook
	const { onChange, onSubmit, values } = 
		useForm<PropertyValues>(llprFormCallback, initialState);

	const [loading, setLoading] = useState(false);

	// submit function that exec upon form submission
	async function llprFormCallback(e?: React.FormEvent)
	{
		e?.preventDefault();
		setLoading(true);

		// send "values" to database
		try
		{
			const res = await fetch(
				"http://localhost:8080/landlordpropreg", 
				{
					method: "POST", 
					headers: {"Content-Type":"application/json"},
					body: JSON.stringify(values), 
					//credentials: "include",
				}
			);

			if(!res.ok)
			{
				const p = await res.json().catch(() => ({}));
				throw new Error(p.message || "Submission Failed");
			}

			window.location.href = "/landlordpropreg";
		}
		catch (err:any)
		{
			alert(err?.message ?? "Catch : Landlord Prop Reg Form Error");
		}
		finally
		{
			setLoading(false);
		}
	}

	return(
		
		<form onSubmit={onSubmit} noValidate>
			<FormContainer title="Property Details">

				<FieldRow>

					<Field label="Address *" full>
						<input
							name='propAddress'
							//id='propAddress'
							placeholder='Address'
							onChange={onChange}
							value={values.propAddress}
							required
						/>
					</Field>

					<Field label="Bedrooms *" full>
						<input
							name='propNumBeds'
							//id='propNumBeds'
							placeholder='Bedroom Count'
							onChange={onChange}
							value={values.propNumBeds}
							required
						/>
					</Field>

					<Field label="Baths *" full>
						<input
							name='propNumBaths'
							//id='propNumBaths'
							placeholder='Bathroom Count'
							onChange={onChange}
							value={values.propNumBaths}
							required
						/>
					</Field>

					<Field label="Sqft *" full>
						<input
							name='propSqft'
							//id='propSqft'
							placeholder='Sqft'
							onChange={onChange}
							value={values.propSqft}
							//required
						/>
					</Field>

					<Field label="Year Built *" full>
						<input
							name='propYearBuilt'
							//id='propYearBuilt'
							placeholder='Year Built'
							onChange={onChange}
							value={values.propYearBuilt}
							//required
						/>
					</Field>

					<Field label="Zoning*" full>
						<input
							name='propZoning'
							//id='propZoning'
							placeholder='Zoning'
							onChange={onChange}
							value={values.propZoning}
							//required
						/>
					</Field>

				</FieldRow>

				<div className={styles.actions}>
					<button type='submit' disabled={loading}>
						{loading ? "Submitting..." : "Submit"}
					</button>
				</div>
			</FormContainer>
		</form>
	);
}


