import { useState } from 'react' 
import { useForm } from "../hooks/useForm.tsx";
import { FormContainer, FieldRow, Field } from "./FormContainer.tsx"
import styles from "./Form.module.css"

// TODO CEW : these are not all strings
interface TenantValues
{
	propAddress:	string,
	fName:			string,
	lName:			string,
	phone:			string,
	email:			string,
	llFName:		string,
	llLName:		string,
	llCoName:		string,
	llEmail:		string,
	llPhone:		string
}

// defining the initial state of our form (all blank)
const initialState: TenantValues = 
{
	propAddress:	"",
	fName:			"",
	lName:			"",
	phone:			"", 
	email:			"", 
	llFName:		"",
	llLName:		"",
	llCoName:		"",
	llEmail:		"",
	llPhone:		""
}

export default function PropertyRegForm_Tenant()
{
	// getting the event handlers from our custom hook
	const { onChange, onSubmit, values } = 
		useForm<PropertyValues>(tenprFormCallback, initialState);

	const [loading, setLoading] = useState(false);

	// submit function that exec upon form submission
	async function tenprFormCallback(e?: React.FormEvent)
	{
		e?.preventDefault();
		setLoading(true);

		// send "values" to database
		try
		{
			const res = await fetch(
				"http://localhost:8080/tenantpropreg", 
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

			window.location.href = "/tenantpropreg";
		}
		catch (err:any)
		{
			alert(err?.message ?? "Catch : Tenant Prop Reg Form Error");
		}
		finally
		{
			setLoading(false);
		}
	}

	return(
		
		<form onSubmit={onSubmit} noValidate>
			<FormContainer title="Tenant - Property Details">

				<FieldRow>

					<Field label="Lease Address" full>
						<input
							name='propAddress'
							//id='propAddress'
							placeholder='Address'
							onChange={onChange}
							value={values.propAddress}
							required
						/>
					</Field>

					<Field label="Tenant First Name" full>
						<input
							name='fName'
							//id='propNumBeds'
							placeholder="'Fantastic'"
							onChange={onChange}
							value={values.fName}
							required
						/>
					</Field>

					<Field label="Tenant Last Name" full>
						<input
							name='lName'
							//id='propNumBaths'
							placeholder="'Four'"
							onChange={onChange}
							value={values.lName}
							required
						/>
					</Field>

					<Field label="Tenant Phone #" full>
						<input
							name='phone'
							//id='propSqft'
							placeholder='000-867-5309'
							onChange={onChange}
							value={values.phone}
							//required
						/>
					</Field>

					<Field label="Tenant Email" full>
						<input
							name='email'
							//id='propYearBuilt'
							placeholder='tenant@slorr.com'
							onChange={onChange}
							value={values.propYearBuilt}
							//required
						/>
					</Field>

					<Field label="Landlord First Name" full>
						<input
							name='Landlords First Name'
							//id='propZoning'
							placeholder='landy'
							onChange={onChange}
							value={values.llFName}
							//required
						/>
					</Field>

					<Field label="Landlord Last Name" full>
						<input
							name='Landlords Last Name'
							//id='propZoning'
							placeholder='lordy'
							onChange={onChange}
							value={values.llLName}
							//required
						/>
					</Field>

					<Field label="Landlord Company" full>
						<input
							name='Landlord Company'
							//id='propZoning'
							placeholder='Landlord LLC'
							onChange={onChange}
							value={values.llCoName}
							//required
						/>
					</Field>

					<Field label="Landlord Email" full>
						<input
							name='Landlord Email'
							//id='propZoning'
							placeholder='landlord@gmail.com'
							onChange={onChange}
							value={values.llEmail}
							//required
						/>
					</Field>

					<Field label="Landlord Phone" full>
						<input
							name='Landlord Phone'
							//id='propZoning'
							placeholder='123-456-7890'
							onChange={onChange}
							value={values.llPhone}
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


