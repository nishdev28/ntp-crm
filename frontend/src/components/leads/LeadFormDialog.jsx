import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, Button, Field, Input, Select, Textarea } from "../ui";
import { leadsApi } from "../../lib/services";
import { LEAD_STAGES, LEAD_PRIORITIES, LEAD_SOURCES } from "../../lib/constants";

/**
 * Create / edit a lead. When `lead` is provided we're editing; otherwise
 * creating. Calls `onSaved(lead)` so the parent can refresh its list.
 */
export function LeadFormDialog({ open, onClose, lead, onSaved }) {
  const editing = Boolean(lead?._id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Reset the form whenever the target lead changes / dialog opens.
  useEffect(() => {
    if (!open) return;
    reset({
      name: lead?.name || "",
      email: lead?.email || "",
      phone: lead?.phone || "",
      company: lead?.company || "",
      status: lead?.status || "New",
      priority: lead?.priority || "Medium",
      source: lead?.source || "Website",
      value: lead?.value || 0,
      notes: lead?.notes || "",
    });
  }, [open, lead, reset]);

  const onSubmit = async (form) => {
    const payload = { ...form, value: Number(form.value) || 0 };
    try {
      const res = editing
        ? await leadsApi.update(lead._id, payload)
        : await leadsApi.create(payload);
      toast.success(editing ? "Lead updated" : "Lead created");
      onSaved?.(res.lead);
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not save lead");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? "Edit Deal Profile" : "Create New Deal"}
      description={editing ? "Update contact details, deal valuation, or pipeline stage." : "Add a qualified opportunity into your pipeline."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact Full Name" error={errors.name?.message} className="col-span-2">
            <Input
              placeholder="e.g. Sarah Jenkins"
              {...register("name", { required: "Name is required" })}
            />
          </Field>
          <Field label="Company / Account">
            <Input placeholder="Acme Global" {...register("company")} />
          </Field>
          <Field label="Email Address">
            <Input type="email" placeholder="sarah@acme.com" {...register("email")} />
          </Field>
          <Field label="Phone Number">
            <Input placeholder="+1 (555) 012-3456" {...register("phone")} />
          </Field>
          <Field label="Deal Value (USD)">
            <Input type="number" min="0" placeholder="10000" {...register("value")} />
          </Field>
          <Field label="Pipeline Stage">
            <Select {...register("status")}>
              {LEAD_STAGES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Priority Level">
            <Select {...register("priority")}>
              {LEAD_PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Acquisition Source" className="col-span-2">
            <Select {...register("source")}>
              {LEAD_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Internal Notes & Context" className="col-span-2">
            <Textarea placeholder="Background, requirements, initial scope, or next milestones…" rows={3} {...register("notes")} />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={isSubmitting}>
            {editing ? "Save Changes" : "Create Opportunity"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
