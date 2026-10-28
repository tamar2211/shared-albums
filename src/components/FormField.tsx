import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  id: string;
  error?:string;
  children:ReactNode;
};


function  FormField({label,id,error,children}:FormFieldProps){
    return(
    <div className="field">
     <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
    )
}
export default FormField;