import { loginSchema, type LoginFormData } from "./authSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormField from "../FormField";
import { authService } from "../../services/authService";
import { useMutation } from "@tanstack/react-query";
import useAuthSuccess from "../../hooks/useAuthSuccess";

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });
    const onAuthSuccess = useAuthSuccess();
    const loginMutation = useMutation({
        mutationFn: (values: LoginFormData) => authService.login(values),
        onSuccess: onAuthSuccess});
    const onSubmit = (data: LoginFormData) => {
        loginMutation.mutate(data)

    };

    return (

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <FormField label="אימייל" id="email" error={errors.email?.message}>
            <input id="email" type="email" autoComplete="email" {...register("email")} />
            </FormField>
            <FormField label="סיסמה" id="password" error={errors.password?.message}>
            <input id="password" type="password" autoComplete="current-password" {...register("password")} />
            </FormField>
            <button type="submit" disabled={loginMutation.isPending}>
             {loginMutation.isPending ? "מתחבר..." : "התחברות"}
            </button>
            {loginMutation.isError && <p>{loginMutation.error.message}</p>}
        </form>
    );
}