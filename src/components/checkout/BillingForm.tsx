import { useFormContext } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { CheckoutSubmissionInput } from "@/lib/checkout/schemas";

export function BillingForm() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const form = useFormContext<CheckoutSubmissionInput>();
  const personType = form.watch("billing.personType");

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billing.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ro ? "Prenume" : "First name"}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-billing-firstname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billing.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ro ? "Nume" : "Last name"}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-billing-lastname" />
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
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" {...field} data-testid="input-billing-email" />
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
                <FormLabel>{ro ? "Telefon" : "Phone"}</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} data-testid="input-billing-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="billing.companyName"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{ro ? "Denumire" : "Company name"}</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-billing-companyname" />
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
                <FormLabel>CUI/CIF</FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-billing-taxid" />
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
                  <Input {...field} data-testid="input-billing-tradereg" />
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
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" {...field} data-testid="input-billing-email" />
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
                <FormLabel>{ro ? "Telefon" : "Phone"}</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} data-testid="input-billing-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="billing.country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ro ? "Țară" : "Country"}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-billing-country" />
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
              <FormLabel>{ro ? "Județ / Sector" : "County"}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-billing-county" />
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
              <FormLabel>{ro ? "Localitate" : "City"}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-billing-city" />
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
              <FormLabel>{ro ? "Stradă și număr" : "Street and number"}</FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-billing-street" />
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
                <Input {...field} data-testid="input-billing-building" />
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
                {ro ? "Cod poștal" : "Postal code"}{" "}
                <span className="text-muted-foreground font-normal">({ro ? "opțional" : "optional"})</span>
              </FormLabel>
              <FormControl>
                <Input {...field} data-testid="input-billing-postal" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
