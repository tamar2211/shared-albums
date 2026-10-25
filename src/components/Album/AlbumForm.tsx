import { useForm } from "react-hook-form";
import {albumSchema, type AlbumFormData} from "./albumSchema"
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "../FormField";

type AlbumFormProps={
   submitLabel:string;
   defaultValues?:AlbumFormData;
   onSubmit:(values: AlbumFormData) => void;
   isPending:boolean;
   errorMessage?:string;
}
export default function AlbumForm({submitLabel,defaultValues,onSubmit,isPending,errorMessage}:AlbumFormProps)
{
    const {
    register,
    handleSubmit,
    formState: { errors },
} = useForm<AlbumFormData>({       
    resolver: zodResolver(albumSchema),  
    defaultValues: defaultValues ?? { name:"",
    description:"",
    allowUpload:true,
    allowDownload:true

 },
});


return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <FormField label="שם האלבום" id="name" error={errors.name?.message}>
            <input id="name" {...register("name")} />
        </FormField>

        <FormField label="תיאור" id="description" error={errors.description?.message}>
            <textarea id="description" {...register("description")} />
        </FormField>

        <FormField label="קטגוריה" id="category" error={errors.category?.message}>
            <select id="category" {...register("category")}>
                <option value="">בחרי קטגוריה</option>
                <option value="family">אירוע משפחתי</option>
                <option value="trip">טיול</option>
                <option value="class">כיתה</option>
                <option value="other">אחר</option>
            </select>
        </FormField>

        <label>
            <input type="checkbox" {...register("allowUpload")} />
            משתתפים יכולים להעלות תמונות
        </label>

        <label>
            <input type="checkbox" {...register("allowDownload")} />
            משתתפים יכולים להוריד תמונות
        </label>

        <button type="submit" disabled={isPending}>
            {isPending ? "שומר..." : submitLabel}
        </button>
        {errorMessage && <p>{errorMessage}</p>}
    </form>
);
}
