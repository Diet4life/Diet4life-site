import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Phone, Mail, Clock, Video } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  goal: z.string().min(1, "Please select a goal"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      goal: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: language === 'ro' ? "Mesaj Trimis!" : "Message Sent!",
      description: language === 'ro' 
        ? "Vă vom contacta în cel mai scurt timp posibil." 
        : "We will contact you as soon as possible.",
    });
    form.reset();
  }

  return (
    <div className="py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {language === 'ro' ? 'Contact & Programări' : 'Contact & Appointments'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ro' 
              ? 'Suntem aici pentru a răspunde întrebărilor tale. Programează o consultație la clinică sau online.' 
              : 'We are here to answer your questions. Book an appointment at the clinic or online.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              {language === 'ro' ? 'Trimite un Mesaj' : 'Send a Message'}
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ro' ? 'Nume Complet' : 'Full Name'}</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
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
                          <Input placeholder="john@example.com" type="email" {...field} data-testid="input-email" />
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
                        <FormLabel>{language === 'ro' ? 'Telefon (Opțional)' : 'Phone (Optional)'}</FormLabel>
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
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ro' ? 'Scopul Consultației' : 'Consultation Goal'}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-goal">
                            <SelectValue placeholder={language === 'ro' ? "Selectează o opțiune" : "Select an option"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weight_loss">{language === 'ro' ? 'Scădere în greutate' : 'Weight loss'}</SelectItem>
                          <SelectItem value="health">{language === 'ro' ? 'Sănătate Generală' : 'General Health'}</SelectItem>
                          <SelectItem value="other">{language === 'ro' ? 'Altul' : 'Other'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'ro' ? 'Mesaj / Detalii suplimentare' : 'Message / Additional details'}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={language === 'ro' ? "Descrie scurt situația ta..." : "Briefly describe your situation..."}
                          className="min-h-[120px]"
                          {...field} 
                          data-testid="input-message"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full sm:w-auto" data-testid="button-submit">
                  {language === 'ro' ? 'Trimite Mesajul' : 'Send Message'}
                </Button>
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
              {language === 'ro' ? 'Contactează-ne' : 'Contact us'}
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
                    {language === 'ro' ? 'Telefon' : 'Phone'}
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
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">
                    {language === 'ro' ? 'Program' : 'Working hours'}
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {language === 'ro' ? 'Luni – Vineri' : 'Monday – Friday'}
                  </p>
                  <p className="text-sm text-muted-foreground">09:00 – 18:00</p>
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
                    {language === 'ro' ? 'Consultații Online' : 'Online Consultations'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {language === 'ro'
                    ? 'Oferim consultații prin Zoom sau Google Meet, disponibile în același program. Ideal dacă ești în altă localitate sau preferi confortul de acasă.'
                    : 'We offer consultations via Zoom or Google Meet, available during the same working hours. Ideal if you are in another city or prefer the comfort of home.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Zoom', 'Google Meet'].map(platform => (
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
