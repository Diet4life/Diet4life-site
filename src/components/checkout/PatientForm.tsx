import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { CheckoutSubmissionInput } from "@/lib/checkout/schemas";

// Only rendered for nutrition_service / consultation products. No medical
// information is ever asked here -- name/email/phone only.
export function PatientForm() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const form = useFormContext<CheckoutSubmissionInput>();
  const sameAsBuyer = form.watch("patient.sameAsBuyer");

  return (
    <div className="space-y-5">
      <Label className="text-sm font-medium text-foreground block">
        {ro ? "Serviciul este pentru tine?" : "Is this service for you?"}
      </Label>

      <label
        htmlFor="patient-same-as-buyer"
        className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 cursor-pointer"
      >
        <Checkbox
          id="patient-same-as-buyer"
          checked={sameAsBuyer}
          onCheckedChange={(checked) =>
            form.setValue("patient.sameAsBuyer", checked === true, { shouldValidate: true })
          }
          data-testid="checkbox-patient-same-as-buyer"
        />
        <span className="text-sm font-medium text-foreground">
          {ro ? "Da, eu voi beneficia de serviciu" : "Yes, I will receive the service"}
        </span>
      </label>

      {!sameAsBuyer && (
        <div className="space-y-5">
          <p className="text-sm font-medium text-foreground">
            {ro ? "Datele persoanei pentru care cumperi serviciul" : "Details of the person you're buying this for"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="patient.fullName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{ro ? "Nume și prenume" : "Full name"} *</FormLabel>
                  <FormControl>
                    <Input className="h-11" {...field} data-testid="input-patient-fullname" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patient.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input className="h-11" type="email" {...field} data-testid="input-patient-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="patient.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{ro ? "Telefon" : "Phone"} *</FormLabel>
                  <FormControl>
                    <Input className="h-11" type="tel" {...field} data-testid="input-patient-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
