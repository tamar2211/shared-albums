import { registerSchema, type RegisterFormData } from "./authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "../FormField";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../../services/authService";
import useAuthSuccess from "../../hooks/useAuthSuccess";
export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });
    const onAuthSuccess = useAuthSuccess();
    const registerMutation = useMutation({
        mutationFn: (values: RegisterFormData) => authService.register(values),
        onSuccess: onAuthSuccess,
    });

    const onSubmit = (data: RegisterFormData) => {
        registerMutation.mutate(data)
    };

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <FormField label="שם משתמש" id="name" error={errors.name?.message}>
    <input id="name" autoComplete="name" {...register("name")} />
</FormField>
<FormField label="אימייל" id="email" error={errors.email?.message}>
    <input id="email" type="email" autoComplete="email" {...register("email")} />
</FormField>
<FormField label="סיסמה" id="password" error={errors.password?.message}>
    <input id="password" type="password" autoComplete="new-password" {...register("password")} />
</FormField>
            <button type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? "נרשם..." : "הרשמה"}
            </button>
            {registerMutation.isError && <p>{registerMutation.error.message}</p>}

        </form>
    );
}

