import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Phone, Mail, Handshake, Video, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { contactSubmissionSchema, type ContactSubmissionInput } from "@/lib/contact/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  // Honeypot -- a real visitor never fills this; kept outside react-hook-form
  // since it isn't part of the validated business schema.
  const [website, setWebsite] = useState("");

  const form = useForm<ContactSubmissionInput>({
    resolver: zodResolver(contactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactSubmissionInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/.netlify/functions/contact-submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, website }),
      });
      if (!res.ok) throw new Error("send_failed");

      setStatus("success");
      toast({
        title: ro ? "Mesajul a fost trimis." : "Your message has been sent.",
        description: ro
          ? "Îți răspund, de obicei, în 1–2 zile lucrătoare, pe email sau telefon."
          : "We usually reply within 1-2 business days, by email or phone.",
      });
      form.reset();
    } catch {
      setStatus("error");
      toast({
        variant: "destructive",
        title: ro ? "Mesajul nu a putut fi trimis." : "Your message could not be sent.",
        description: ro
          ? "A apărut o problemă tehnică la trimiterea mesajului. Te rugăm să încerci din nou sau să ne scrii direct la contact@diet4lifeconcept.ro."
          : "A technical problem occurred while sending your message. Please try again, or write to us directly at contact@diet4lifeconcept.ro.",
      });
    }
  }

  return (
    <div className="py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {ro ? "Contact & Programări" : "Contact & Appointments"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {ro
              ? "Sunt aici pentru a răspunde întrebărilor tale. Programează o consultație online."
              : "I'm here to answer your questions. Book an online consultation."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              {ro ? "Trimite un Mesaj" : "Send a Message"}
            </h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot -- clipped to 1x1px rather than display:none, so
                    simple bots that skip hidden/display:none fields still
                    fill it. Clipped in place (not pushed off-screen with a
                    large negative offset) so it can never affect the page's
                    scrollable width. */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute w-px h-px p-0 m-[-1px] overflow-hidden whitespace-nowrap border-0"
                  style={{ clip: "rect(0,0,0,0)" }}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ro ? "Nume Complet" : "Full Name"}</FormLabel>
                      <FormControl>
                        <Input placeholder={ro ? "Ana Popescu" : "Jane Doe"} {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder={ro ? "ana@exemplu.ro" : "jane@example.com"} type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{ro ? "Telefon (Opțional)" : "Phone (Optional)"}</FormLabel>
                        <FormControl>
                          <Input placeholder="+40 700 000 000" type="tel" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{ro ? "Mesaj / Detalii suplimentare" : "Message / Additional details"}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={ro ? "Descrie scurt situația ta..." : "Briefly describe your situation..."}
                          className="min-h-[120px]"
                          {...field}
                          data-testid="input-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "submitting"} data-testid="button-submit">
                  {status === "submitting" && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {status === "submitting" ? (ro ? "Se trimite..." : "Sending...") : ro ? "Trimite Mesajul" : "Send Message"}
                </Button>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {ro
                    ? "Mesajul tău este folosit doar pentru a-ți răspunde la această solicitare. Te rugăm să nu incluzi analize, documente medicale sau alte informații medicale sensibile în acest formular — le putem discuta direct în cadrul consultației."
                    : "Your message is used only to respond to your request. Please don't include test results, medical documents, or other sensitive medical information in this form — we can go over those directly during your consultation."}
                </p>
              </form>
            </Form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col h-full"
          >
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              {ro ? "Contactează-ne" : "Contact us"}
            </h2>

            <div className="space-y-5 bg-secondary/30 p-8 rounded-2xl flex-1 border border-border">
              <a
                href="tel:0766572968"
                className="flex items-center gap-4 group hover:bg-background rounded-xl p-4 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    {ro ? "Telefon" : "Phone"}
                  </p>
                  <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    0766 572 968
                  </p>
                </div>
              </a>

              <a
                href="mailto:contact@diet4lifeconcept.ro"
                className="flex items-center gap-4 group hover:bg-background rounded-xl p-4 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    Email
                  </p>
                  <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    contact@diet4lifeconcept.ro
                  </p>
                </div>
              </a>

              {/* Program */}
              <div className="flex items-center gap-4 rounded-xl p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    {ro ? "Program" : "Schedule"}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {ro ? "Stabilit de comun acord" : "Set by mutual agreement"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ro
                      ? "Fiind totul online, găsim împreună un interval potrivit pentru tine."
                      : "Since everything is online, we'll find a time that works for you together."}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border mx-4" />

              {/* Online consultations */}
              <div className="rounded-xl bg-primary/8 border border-primary/20 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-foreground">
                    {ro ? "Consultații Online" : "Online Consultations"}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {ro
                    ? "Toate consultațiile se desfășoară online — prin Zoom, Google Meet sau WhatsApp, în funcție de ce ți se potrivește mai bine. Poți participa de oriunde, fără deplasare."
                    : "All consultations take place online — via Zoom, Google Meet or WhatsApp, whichever suits you best. You can join from anywhere, no travel needed."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Zoom", "Google Meet", "WhatsApp"].map((platform) => (
                    <span key={platform} className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
