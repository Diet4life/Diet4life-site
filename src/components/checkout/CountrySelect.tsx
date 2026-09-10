import { forwardRef, useState } from "react";
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

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip diacritics (ă/â/î/ș/ț -> a/a/i/s/t)
}

interface CountrySelectProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
  ["aria-describedby"]?: string;
  ["aria-invalid"]?: boolean | "true" | "false";
  ["data-testid"]?: string;
}

// Searchable country selector -- country_code (ISO 3166-1 alpha-2) is what
// gets stored; the label shown is localized to the interface language.
// Selecting a country is the *only* way to change the value -- there's no
// free-text path, so an invalid/unlisted code can never reach the form
// state. forwardRef + spreading id/aria-* is what lets shadcn's
// <FormControl> (a Radix Slot) wire this up exactly like a plain <Input>:
// associated label, aria-describedby to the error message, aria-invalid.
export const CountrySelect = forwardRef<HTMLButtonElement, CountrySelectProps>(
  ({ value, onChange, id, "aria-describedby": describedBy, "aria-invalid": invalid, "data-testid": testId }, ref) => {
    const { language } = useLanguage();
    const ro = language === "ro";
    const [open, setOpen] = useState(false);

    const selected = COUNTRIES.find((c) => c.code === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ro ? "Selectează țara" : "Select country"}
            data-testid={testId}
            className="w-full h-11 justify-between font-normal border-input"
          >
            <span className="truncate">
              {selected ? (ro ? selected.ro : selected.en) : ro ? "Selectează țara" : "Select country"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command
            filter={(itemValue, search) => {
              const country = COUNTRIES.find((c) => c.code === itemValue);
              if (!country) return 0;
              // Diacritic-insensitive: "Franta" (no ț) must still find "Franța" --
              // a very common way to type when in a hurry or on a non-RO keyboard.
              const haystack = normalizeForSearch(`${country.ro} ${country.en} ${country.code}`);
              return haystack.includes(normalizeForSearch(search)) ? 1 : 0;
            }}
          >
            <CommandInput
              placeholder={ro ? "Caută o țară..." : "Search a country..."}
              aria-label={ro ? "Caută o țară" : "Search a country"}
            />
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
                    className="min-h-11 py-2.5 cursor-pointer"
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4 shrink-0", value === country.code ? "opacity-100" : "opacity-0")}
                    />
                    <span className="truncate">{ro ? country.ro : country.en}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);
CountrySelect.displayName = "CountrySelect";
