import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COUNTRIES } from "@/lib/checkout/countries";

// Searchable country selector -- country_code (ISO 3166-1 alpha-2) is what
// gets stored; the label shown is localized to the interface language.
export function CountrySelect({
  value,
  onChange,
  testId,
}: {
  value: string;
  onChange: (code: string) => void;
  testId?: string;
}) {
  const { language } = useLanguage();
  const ro = language === "ro";
  const [open, setOpen] = useState(false);

  const selected = COUNTRIES.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          data-testid={testId}
          className="w-full h-11 justify-between font-normal border-input"
        >
          {selected ? (ro ? selected.ro : selected.en) : ro ? "Selectează țara" : "Select country"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(value, search) => {
            const country = COUNTRIES.find((c) => c.code === value);
            if (!country) return 0;
            const haystack = `${country.ro} ${country.en} ${country.code}`.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={ro ? "Caută o țară..." : "Search a country..."} />
          <CommandList>
            <CommandEmpty>{ro ? "Nicio țară găsită." : "No country found."}</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", value === country.code ? "opacity-100" : "opacity-0")}
                  />
                  {ro ? country.ro : country.en}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
