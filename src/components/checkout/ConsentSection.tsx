import { useFormContext } from "react-hook-form";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckoutSubmissionInput } from "@/lib/checkout/schemas";

// Plain <p>, not the shadcn <FormMessage>: that component calls
// useFormField(), which requires a surrounding <FormField>/<FormItem> --
// this checkbox is hand-wired (react-hook-form's boolean/literal(true)
// mismatch doesn't map cleanly onto FormField's render-prop pattern), so
// using <FormMessage> here throws as soon as an error appears.
function ConsentError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[0.8rem] font-medium text-destructive">{message}</p>;
}

// Only Terms & Conditions require an explicit checkbox. The Privacy Policy
// is informational text with a link -- continuing the order is treated as
// acknowledgement, not a second mandatory checkbox (per explicit request).
export function ConsentSection() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const form = useFormContext<CheckoutSubmissionInput>();

  const termsError = form.formState.errors.consent?.termsAccepted;

  return (
    <div className="space-y-3">
      <label htmlFor="consent-terms" className="flex items-start gap-3 cursor-pointer">
        <Checkbox
          id="consent-terms"
          checked={form.watch("consent.termsAccepted") === true}
          onCheckedChange={(checked) =>
            form.setValue("consent.termsAccepted", (checked === true) as true, { shouldValidate: true })
          }
          data-testid="checkbox-consent-terms"
        />
        <span className="text-sm text-foreground leading-relaxed">
          {ro ? "Am citit și accept " : "I have read and accept the "}
          <Link href="/termeni" target="_blank" className="text-primary underline underline-offset-2">
            {ro ? "Termenii și condițiile" : "Terms and Conditions"}
          </Link>
          .
        </span>
      </label>
      <ConsentError message={termsError?.message as string | undefined} />

      <p className="text-xs text-muted-foreground leading-relaxed">
        {ro ? "Prin continuarea comenzii confirmi că ai luat la cunoștință " : "By continuing your order you confirm you have reviewed our "}
        <Link href="/confidentialitate" target="_blank" className="text-primary underline underline-offset-2">
          {ro ? "Politica de confidențialitate" : "Privacy Policy"}
        </Link>
        .
      </p>
    </div>
  );
}
