import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { guestJoinSchema, type GuestJoinFormData } from "./authSchemas";
import FormField from "../FormField";
type GuestJoinFormProps = {
    onSubmit: (name: string) => void
    isPending: boolean
}
export default function GuestJoinForm({ onSubmit, isPending }: GuestJoinFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GuestJoinFormData>({
        resolver: zodResolver(guestJoinSchema),
    });
    return (
        <form onSubmit={handleSubmit((data) => onSubmit(data.name))}>
            <FormField label="שם לתצוגה" id="name" error={errors.name?.message}>
                <input id="name"  {...register("name")} />
            </FormField>
        <button className="btn btn-primary form-submit" type="submit" disabled={isPending}>{isPending ? "מצטרף..." : "הצטרפות"}</button>
        </form>
    )
}
