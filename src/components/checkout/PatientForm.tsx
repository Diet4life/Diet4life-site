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
        {ro ? "Cine va beneficia de serviciu?" : "Who will receive the service?"}
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
          {ro ? "Eu sunt pacientul" : "I am the patient"}
        </span>
      </label>

      {!sameAsBuyer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patient.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ro ? "Prenume pacient" : "Patient first name"}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-patient-firstname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="patient.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ro ? "Nume pacient" : "Patient last name"}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-patient-lastname" />
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
                <FormLabel>{ro ? "E-mail pacient" : "Patient e-mail"}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} data-testid="input-patient-email" />
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
                <FormLabel>{ro ? "Telefon pacient" : "Patient phone"}</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} data-testid="input-patient-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
}
