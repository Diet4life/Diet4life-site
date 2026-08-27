import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Nutrition from "@/pages/Nutrition";
import Calculator from "@/pages/Calculator";
import Recipes from "@/pages/Recipes";
import Blog from "@/pages/Blog";
import Products from "@/pages/Products";
import Contact from "@/pages/Contact";
import Education from "@/pages/Education";
import EducationNutrition from "@/pages/EducationNutrition";
import EducationPrevention from "@/pages/EducationPrevention";
import EducationKids from "@/pages/EducationKids";
import EducationFun from "@/pages/EducationFun";
import Consultatii from "@/pages/Consultatii";
import DeCeNuSlabescDacaMananc from "@/pages/articles/DeCeNuSlabescDacaMananc";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/nutrition" component={Nutrition} />
        <Route path="/calculator" component={Calculator} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/blog" component={Blog} />
        <Route path="/products" component={Products} />
        <Route path="/contact" component={Contact} />
        <Route path="/education" component={Education} />
        <Route path="/education/nutrition" component={EducationNutrition} />
        <Route path="/education/prevention" component={EducationPrevention} />
        <Route path="/education/kids" component={EducationKids} />
        <Route path="/education/fun" component={EducationFun} />
        <Route path="/consultatii" component={Consultatii} />
        <Route path="/articole/de-ce-nu-slabesc-daca-mananc-putin" component={DeCeNuSlabescDacaMananc} />
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
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
