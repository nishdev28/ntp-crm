import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button, Field, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", password: "" } });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Convenience: pre-fill the seeded demo credentials.
  const useDemo = () => {
    setValue("email", "alex@timetoprogram.com");
    setValue("password", "password123");
  };

  return (
    <AuthShell>
      <div className="rounded-2xl border border-white/[0.07] bg-panel p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">Sign in to workspace</h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your credentials to access your pipeline and contacts.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Work Email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="alex@timetoprogram.com"
                className="pl-9 text-sm"
                {...register("email", { required: "Email is required" })}
              />
            </div>
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-9 text-sm"
                {...register("password", { required: "Password is required" })}
              />
            </div>
          </Field>

          <Button type="submit" className="w-full text-sm font-semibold" size="md" loading={submitting}>
            Sign in
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-800 pt-5">
          <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500">Fast Evaluation</span>
              <span className="font-mono text-[10px] text-slate-400">demo</span>
            </div>
            <button
              type="button"
              onClick={useDemo}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-800/40 hover:text-slate-50 active:bg-slate-800"
            >
              Fill Demo Credentials
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-slate-50 hover:underline">
            Register workspace
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
