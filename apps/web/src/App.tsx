import { BrowserRouter, Route, Routes } from "react-router-dom";
import { configurato } from "./lib/supabase";
import { Home } from "./pagine/Home";
import { Invito } from "./pagine/Invito";
import { Partita } from "./pagine/Partita";
import { PaginaRegole } from "./pagine/Regole";
import { Protezione } from "./Protezione";
import { FornitoreSkin } from "./giochi/primo-gioco/skin";
import { skinSalvata } from "./lib/ricordi";
import { Errore, Pagina } from "./ui";

export function App() {
  if (!configurato) {
    return (
      <Pagina>
        <Errore testo="Manca la configurazione di Supabase (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)." />
      </Pagina>
    );
  }
  return (
    <Protezione>
    <FornitoreSkin skin={skinSalvata()}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:codice" element={<Invito />} />
        <Route path="/partita/:id" element={<Partita />} />
        <Route path="/regole" element={<PaginaRegole />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
    </FornitoreSkin>
    </Protezione>
  );
}
