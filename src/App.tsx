import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ScrollToTop } from "@/components/ScrollToTop";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Calculator from "@/pages/Calculator";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import Consultatii from "@/pages/Consultatii";
import NutriHub from "@/pages/nutrihub";
import NutritieEchilibrata from "@/pages/nutrihub/NutritieEchilibrata";
import ControlulGreutatii from "@/pages/nutrihub/ControlulGreutatii";
import CataProteinaAmNevoie from "@/pages/nutrihub/CataProteinaAmNevoie";
import CateCaloriiAmNevoie from "@/pages/nutrihub/CateCaloriiAmNevoie";
import FibreleAlimentare from "@/pages/nutrihub/FibreleAlimentare";
import NutriPentruCopii from "@/pages/NutriPentruCopii";
import Checkout from "@/pages/Checkout";
import CheckoutReturn from "@/pages/CheckoutReturn";
import Termeni from "@/pages/Termeni";
import Confidentialitate from "@/pages/Confidentialitate";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/calculator" component={Calculator} />
        <Route path="/products" component={Products} />
        <Route path="/contact" component={Contact} />
        <Route path="/consultatii" component={Consultatii} />
        <Route path="/nutrihub" component={NutriHub} />
        <Route path="/nutrihub/nutritie-echilibrata" component={NutritieEchilibrata} />
        <Route path="/nutrihub/controlul-greutatii" component={ControlulGreutatii} />
        <Route path="/nutrihub/cata-proteina-am-nevoie" component={CataProteinaAmNevoie} />
        <Route path="/nutrihub/cate-calorii-am-nevoie" component={CateCaloriiAmNevoie} />
        <Route path="/nutrihub/fibrele-alimentare" component={FibreleAlimentare} />
        <Route path="/nutri-pentru-copii" component={NutriPentruCopii} />
        <Route path="/checkout/retur" component={CheckoutReturn} />
        <Route path="/checkout/:slug" component={Checkout} />
        <Route path="/termeni" component={Termeni} />
        <Route path="/confidentialitate" component={Confidentialitate} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <SmoothScroll>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </SmoothScroll>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
