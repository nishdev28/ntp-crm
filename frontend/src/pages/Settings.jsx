import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  User,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  Mail,
  KeyRound,
} from "lucide-react";

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Field,
  Badge,
  Avatar,
  Spinner,
} from "../components/ui";
import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { authApi, aiApi } from "../lib/services";
import { shortDate } from "../lib/format";
import { cn } from "../lib/utils";

/* ── Small icon accent rendered beside each card title ─────────── */
function SectionIcon({ icon: Icon, className }) {
  return (
    <div
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </div>
  );
}

/* ── 1. Profile form ────────────────────────────────────────────── */
function ProfileCard({ user, updateUser }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Sync form whenever user object changes (initial load or external update).
  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name || "",
      company: user.company || "",
      avatar: user.avatar || "",
    });
  }, [user, reset]);

  const onSubmit = async (form) => {
    try {
      const res = await authApi.updateProfile(form);
      updateUser(res.user);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Could not update profile");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <SectionIcon icon={User} />
          <div>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Manage your name, organization, and avatar.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Avatar preview row */}
        <div className="mb-5 flex items-center gap-3.5 rounded-lg border border-slate-800 bg-slate-800/40 px-4 py-3">
          <Avatar name={user?.name} src={user?.avatar} size="lg" />
          <div>
            <p className="text-xs font-semibold text-slate-50">{user?.name}</p>
            <p className="text-[11px] text-slate-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field
              label="Full Name"
              error={errors.name?.message}
              className="sm:col-span-2"
            >
              <Input
                placeholder="Your full name"
                {...register("name", { required: "Name is required" })}
              />
            </Field>

            <Field label="Organization / Company">
              <Input placeholder="Your company" {...register("company")} />
            </Field>

            {/* Email is read-only */}
            <Field label="Email Address">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={user?.email || ""}
                  disabled
                  className="pl-8.5"
                  readOnly
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Email address is managed by workspace administrator.
              </p>
            </Field>

            <Field
              label="Avatar Image URL"
              error={errors.avatar?.message}
              className="sm:col-span-2"
            >
              <Input
                placeholder="https://example.com/photo.jpg"
                {...register("avatar")}
              />
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm" type="submit" loading={isSubmitting}>
              Save Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ── 2. Security / change-password form ────────────────────────── */
function SecurityCard() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch("password");

  const onSubmit = async ({ password }) => {
    try {
      await authApi.updateProfile({ password });
      toast.success("Password updated");
      reset();
    } catch (err) {
      toast.error(err.message || "Could not update password");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <SectionIcon icon={Lock} />
          <div>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>Update your password to keep your account safe.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="New Password" error={errors.password?.message}>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Min. 6 characters"
                  className="pl-8.5"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Must be at least 6 characters",
                    },
                  })}
                />
              </div>
            </Field>

            <Field
              label="Confirm New Password"
              error={errors.confirmPassword?.message}
            >
              <Input
                type="password"
                placeholder="Re-enter password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (v) =>
                    v === newPassword || "Passwords do not match",
                })}
              />
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <Button size="sm" type="submit" loading={isSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ── 3. AI Integration status card ─────────────────────────────── */
function AiIntegrationCard() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    aiApi
      .status()
      .then((res) => setStatus(res))
      .catch(() => setStatus({ success: false, configured: false, model: null }));
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-200">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <CardTitle>AI Integration</CardTitle>
            <CardDescription>
              Google Gemini powers automated summaries, email drafts, and pipeline intelligence.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {status === null ? (
          <div className="flex items-center gap-2.5 py-2">
            <Spinner className="p-0" />
            <span className="text-xs text-slate-500">Checking service status...</span>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              {status.configured ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="h-3 w-3" />
                  Active & Connected
                </Badge>
              ) : (
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  <AlertCircle className="h-3 w-3" />
                  API Key Missing
                </Badge>
              )}

              {status.model && (
                <span className="rounded border border-slate-800 bg-slate-800/40 px-2 py-0.5 font-mono text-[11px] text-slate-300">
                  {status.model}
                </span>
              )}
            </div>

            {!status.configured && (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-300">
                <p className="font-semibold mb-1">Configuration Needed</p>
                <p className="text-amber-800/90 leading-relaxed">
                  Provide{" "}
                  <code className="rounded bg-amber-500/15 px-1 py-0.5 font-mono text-[11px] text-amber-300">
                    GEMINI_API_KEY=your_key
                  </code>{" "}
                  in the backend <code className="font-mono text-[11px]">.env</code>{" "}
                  file and restart server.
                </p>
              </div>
            )}

            {status.configured && (
              <p className="text-xs text-slate-500">
                Connected and ready. Pipeline summaries and follow-up email generation are powered by{" "}
                <span className="font-medium text-slate-100">{status.model}</span>.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── 4. Account info + logout ───────────────────────────────────── */
function AccountCard({ user, logout }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <SectionIcon icon={Shield} />
          <div>
            <CardTitle>Session & Role</CardTitle>
            <CardDescription>Manage your workspace credentials and active session.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Role */}
          <div className="rounded-lg border border-slate-800 bg-slate-800/40 px-3.5 py-2.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Workspace Role
            </p>
            <Badge className="bg-slate-800 text-slate-200 capitalize">
              {user?.role || "Member"}
            </Badge>
          </div>

          {/* Member since */}
          <div className="rounded-lg border border-slate-800 bg-slate-800/40 px-3.5 py-2.5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Account Created
            </p>
            <p className="text-xs font-semibold text-slate-50">
              {shortDate(user?.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="danger" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Page root ──────────────────────────────────────────────────── */
export default function Settings() {
  const { user, updateUser, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and integrations."
      />

      <ProfileCard user={user} updateUser={updateUser} />
      <SecurityCard />
      <AiIntegrationCard />
      <AccountCard user={user} logout={logout} />
    </div>
  );
}
