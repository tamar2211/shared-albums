import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  id: string;
  error?:string;
  children:ReactNode;
};


function  FormField({label,id,error,children}:FormFieldProps){
    return(
    <div>
     <label htmlFor={id}>{label}</label>
      {children}
      {error && <p>{error}</p>}
    </div>
    )
}
export default FormField;