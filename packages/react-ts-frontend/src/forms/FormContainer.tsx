// FormContainer.tsx
import React from "react";
import styles from "./Form.module.css";

type PropsWithChildren = { children?: React.ReactNode; className?: string };

export function FormContainer
(
	{
		title,
		children,
		className,
	}: 
		{ title?: string } & PropsWithChildren
) 
{
	return (
		<div className={`${styles.container} ${className ?? ""}`}>
			<fieldset
				aria-labelledby={title ? "form-title" : undefined}
        		style={{ border: "none", padding: 0 }}>
        		{title && <div id="form-title" className={styles.legend}>{title}</div>}
        		{children}
      		</fieldset>
    	</div>
	);
}

export function FieldRow({ children, className }: PropsWithChildren)
{
  return <div className={`${styles.grid2} ${className ?? ""}`}>{children}</div>;
}

type FieldProps = 
{
  label: string;
  htmlFor?: string;
  full?: boolean;
  children?: React.ReactNode;
};

export function Field({ label, htmlFor, full = false, children }: FieldProps)
{
	const wrapperClass = full ? styles.full : undefined;

	// If child is a single valid React element, clone to add id/className; otherwise render as-is.
	let renderedChildren = children;
  	if (React.isValidElement(children))
	{
    	const childElement = children as React.ReactElement;
    	// Build props to merge: id (from htmlFor) and add our input class while preserving existing className
    	const existingClass = (childElement.props && (childElement.props as any).className) || "";
    	const childProps: Partial<Record<string, unknown>> =
		{
      		id: htmlFor,
      		className: `${existingClass} ${styles.input}`.trim(),
    	};
    	renderedChildren = React.cloneElement(childElement, childProps);
	}

	return (
		<div className={wrapperClass}>
			<label htmlFor={htmlFor} className={styles.formLabel}>
				{label}
			</label>
			{renderedChildren}
		</div>
	);
}
