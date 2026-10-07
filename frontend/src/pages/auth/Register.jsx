import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { User, Mail, Lock, Building2 } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button, Field, Input } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await registerUser(data);
      toast.success("Account created — welcome to NTP CRM! 🎉");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="rounded-2xl border border-white/[0.07] bg-panel p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-slate-50">Create workspace</h1>
          <p className="mt-1 text-xs text-slate-500">
            Set up your organization and begin managing your sales pipeline.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Full Name" error={errors.name?.message}>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Alex Morgan"
                className="pl-9 text-sm"
                {...register("name", { required: "Name is required" })}
              />
            </div>
          </Field>

          <Field label="Company / Organization" error={errors.company?.message}>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Acme Global Inc."
                className="pl-9 text-sm"
                {...register("company")}
              />
            </div>
          </Field>

          <Field label="Work Email" error={errors.email?.message}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="email"
                placeholder="alex@company.com"
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
                placeholder="Minimum 6 characters"
                className="pl-9 text-sm"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
            </div>
          </Field>

          <Button type="submit" className="w-full text-sm font-semibold mt-2" size="md" loading={submitting}>
            Create workspace
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-50 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
