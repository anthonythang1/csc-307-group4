import { useState } from "react";

type UseFormReturn<T> = 
{
	values: T;
	onChange: 
	(
		e: React.ChangeEvent	<HTMLInputElement |
			  					HTMLSelectElement |
								HTMLTextAreaElement>
	) => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function useForm<T>(callback: (e?: React.FormEvent) =>
	Promise<void> | void, initialState: T): UseFormReturn<T> 
	{
		const [values, setValues] = useState<T>(initialState);
		const onChange = (event: React.ChangeEvent<HTMLInputElement |
						 						 HTMLSelectElement | 
												 HTMLTextAreaElement>) => 
		{
    		const { name, value, type, checked } = event.target as HTMLInputElement;
    		setValues(
				prev => 
				(
					{	...(prev as any),
						[name]: type === "checkbox" ? checked : value 
					}
				)
			);
  		};
	
	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) =>
	{
    	event.preventDefault();
    	await callback(event);
  	};

	return { values, onChange, onSubmit };
}
