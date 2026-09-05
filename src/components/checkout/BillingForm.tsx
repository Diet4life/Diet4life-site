import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CountrySelect } from "@/components/checkout/CountrySelect";
import { DEFAULT_COUNTRY_CODE, isPostalCodeRequired } from "@/lib/checkout/countries";
import type { CheckoutSubmissionInput } from "@/lib/checkout/schemas";

// Address field labels adapt to the selected country -- Romania's own
// administrative terms (Județ/Localitate/Stradă) vs. a generic
// State-Province/City/Address set for everywhere else, per the "must work
// for international customers" requirement. Same DB columns either way
// (county/city/street_address) -- this is a display-only adaptation.
function addressLabels(countryCode: string, ro: boolean) {
  if (countryCode === DEFAULT_COUNTRY_CODE) {
    return {
      region: ro ? "Județ / Sector" : "County / Sector",
      city: ro ? "Localitate" : "City",
      street: ro ? "Stradă și număr" : "Street and number",
    };
  }
  return {
    region: ro ? "Stat / Regiune / Provincie" : "State / Region / Province",
    city: ro ? "Oraș" : "City",
    street: ro ? "Adresă" : "Address",
  };
}

const inputClass = "h-11";

export function BillingForm() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const form = useFormContext<CheckoutSubmissionInput>();
  const personType = form.watch("billing.personType");
  const countryCode = form.watch("billing.countryCode") ?? DEFAULT_COUNTRY_CODE;
  const labels = addressLabels(countryCode, ro);
  const postalRequired = isPostalCodeRequired(countryCode);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium text-foreground mb-3 block">
          {ro ? "Pentru cine se emite factura?" : "Who is the invoice for?"}
        </Label>
        <RadioGroup
          value={personType}
          onValueChange={(value) => {
            form.setValue("billing.personType", value as "individual" | "company", {
              shouldValidate: true,
            });
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <label
            htmlFor="billing-individual"
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-colors"
          >
            <RadioGroupItem value="individual" id="billing-individual" />
            <span className="text-sm font-medium text-foreground">
              {ro ? "Persoană fizică" : "Individual"}
            </span>
          </label>
          <label
            htmlFor="billing-company"
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 transition-colors"
          >
            <RadioGroupItem value="company" id="billing-company" />
            <span className="text-sm font-medium text-foreground">
              {ro ? "Persoană juridică / PFA" : "Company / Sole trader"}
            </span>
          </label>
        </RadioGroup>
      </div>

      {personType === "individual" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="billing.fullName"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{ro ? "Nume și prenume" : "Full name"} *</FormLabel>
                <FormControl>
                  <Input className={inputClass} {...field} data-testid="input-billing-fullname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail *</FormLabel>
                <FormControl>
                  <Input className={inputClass} type="email" {...field} data-testid="input-billing-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ro ? "Telefon" : "Phone"} *</FormLabel>
                <FormControl>
                  <Input className={inputClass} type="tel" {...field} data-testid="input-billing-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="billing.companyName"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{ro ? "Denumire" : "Company name"} *</FormLabel>
                <FormControl>
                  <Input className={inputClass} {...field} data-testid="input-billing-companyname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing.taxId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUI/CIF *</FormLabel>
                <FormControl>
                  <Input className={inputClass} {...field} data-testid="input-billing-taxid" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing.tradeRegistryNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {ro ? "Nr. Registrul Comerțului" : "Trade Registry no."}{" "}
                  <span className="text-muted-foreground font-normal">({ro ? "opțional" : "optional"})</span>
                </FormLabel>
                <FormControl>
                  <Input className={inputClass} {...field} data-testid="input-billing-tradereg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail *</FormLabel>
                <FormControl>
                  <Input className={inputClass} type="email" {...field} data-testid="input-billing-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ro ? "Telefon" : "Phone"} *</FormLabel>
                <FormControl>
                  <Input className={inputClass} type="tel" {...field} data-testid="input-billing-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="billing.countryCode"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>{ro ? "Țară" : "Country"} *</FormLabel>
              <FormControl>
                <CountrySelect
                  value={field.value}
                  onChange={field.onChange}
                  data-testid="select-billing-country"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billing.county"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.region} *</FormLabel>
              <FormControl>
                <Input className={inputClass} {...field} data-testid="input-billing-county" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billing.city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.city} *</FormLabel>
              <FormControl>
                <Input className={inputClass} {...field} data-testid="input-billing-city" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billing.streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{labels.street} *</FormLabel>
              <FormControl>
                <Input className={inputClass} {...field} data-testid="input-billing-street" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billing.buildingDetails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {ro ? "Bloc / scară / apartament" : "Building / entrance / apt."}{" "}
                <span className="text-muted-foreground font-normal">({ro ? "opțional" : "optional"})</span>
              </FormLabel>
              <FormControl>
                <Input className={inputClass} {...field} data-testid="input-billing-building" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="billing.postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {ro ? "Cod poștal" : "Postal code"}
                {postalRequired ? " *" : (
                  <span className="text-muted-foreground font-normal"> ({ro ? "opțional" : "optional"})</span>
                )}
              </FormLabel>
              <FormControl>
                <Input className={inputClass} {...field} data-testid="input-billing-postal" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
