import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function Hausrechner() {
  const [netto1, setNetto1] = useState(0);
  const [netto2, setNetto2] = useState(0);
  const [kindergeld, setKindergeld] = useState(0);
  const [weitereEinnahmen, setWeitereEinnahmen] = useState(0);

  const [ausgaben, setAusgaben] = useState(0);
  const [kreditsumme, setKreditsumme] = useState(400000);
  const [zins, setZins] = useState(3.5);
  const [zinsbindung, setZinsbindung] = useState(10);
  const [tilgungProzent, setTilgungProzent] = useState(2);
  const [tilgungEuro, setTilgungEuro] = useState(Math.round(((2 / 100) * 400000) / 12));

  const [sondertilgungen, setSondertilgungen] = useState([]);

  const handleTilgungProzentChange = (val) => {
    const p = parseFloat(val);
    setTilgungProzent(p);
    if (kreditsumme > 0) {
      setTilgungEuro(((p / 100) * kreditsumme) / 12);
    }
  };

  const handleTilgungEuroChange = (val) => {
    const e = parseFloat(val);
    setTilgungEuro(e);
    if (kreditsumme > 0) {
      setTilgungProzent((e * 12 * 100) / kreditsumme);
    }
  };

  const addSondertilgung = () => {
    setSondertilgungen([...sondertilgungen, { start: 1, dauer: 1, betrag: 5000 }]);
  };

  const updateSondertilgung = (index, field, value) => {
    const newList = [...sondertilgungen];
    newList[index][field] = parseInt(value);
    setSondertilgungen(newList);
  };

  const removeSondertilgung = (index) => {
    const newList = [...sondertilgungen];
    newList.splice(index, 1);
    setSondertilgungen(newList);
  };

  const monatlicheZinslast = (betrag) => (betrag * (zins / 100)) / 12;
  const monatlicheRate = tilgungEuro + monatlicheZinslast(kreditsumme);
  const gesamtEinkommen = netto1 + netto2 + kindergeld + weitereEinnahmen;
  const uebrig = gesamtEinkommen - ausgaben - monatlicheRate;

  const generateTilgungsverlauf = () => {
    const verlauf = [];
    const zahlungsverlauf = [];
    let rest = kreditsumme;
    let gesamtZinsen = 0;
    let monate = 0;
    let zinsenBisZinsbindung = 0;
    let restschuldNachZinsbindung = kreditsumme;

    for (let jahr = 1; jahr <= 50; jahr++) {
      let zinsenJahr = 0;
      for (let m = 0; m < 12; m++) {
        if (rest <= 0) break;
        const zinsAnteil = (rest * zins) / 100 / 12;
        const tilgung = monatlicheRate - zinsAnteil;
        rest -= tilgung;
        gesamtZinsen += zinsAnteil;
        if (jahr <= zinsbindung) zinsenBisZinsbindung += zinsAnteil;

        zahlungsverlauf.push({
          Monat: monate,
          Zinsen: Math.round(zinsAnteil),
          Tilgung: Math.round(tilgung),
          Gesamt: Math.round(monatlicheRate),
        });

        monate++;
      }

      sondertilgungen.forEach((s) => {
        if (jahr >= s.start && jahr < s.start + s.dauer) {
          rest -= s.betrag;
        }
      });

      if (jahr === zinsbindung) restschuldNachZinsbindung = rest;
      if (rest < 0) rest = 0;

      verlauf.push({ Jahr: jahr, Restschuld: Math.round(rest) });
      if (rest === 0) break;
    }

    return {
      verlauf,
      zahlungsverlauf,
      monate,
      gesamtkosten: Math.round(kreditsumme + gesamtZinsen),
      restschuldNachZinsbindung: Math.round(restschuldNachZinsbindung),
      zinsenBisZinsbindung: Math.round(zinsenBisZinsbindung),
    };
  };

  const { verlauf: tilgungsverlauf, zahlungsverlauf, monate, gesamtkosten, restschuldNachZinsbindung, zinsenBisZinsbindung } = generateTilgungsverlauf();

  return (
    <div className="grid gap-4 p-4 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold">Hausfinanzierungsrechner</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
        <CardContent className="grid gap-2 p-4">
          <h2 className="text-xl font-semibold">Einnahmen</h2>
          <Label>Nettoeinkommen Person 1</Label>
          <Input type="number" value={netto1} onChange={(e) => setNetto1(+e.target.value)} />
          <Label>Nettoeinkommen Person 2</Label>
          <Input type="number" value={netto2} onChange={(e) => setNetto2(+e.target.value)} />
          <Label>Kindergeld</Label>
          <Input type="number" value={kindergeld} onChange={(e) => setKindergeld(+e.target.value)} />
          <Label>Weitere Einnahmen</Label>
          <Input type="number" value={weitereEinnahmen} onChange={(e) => setWeitereEinnahmen(+e.target.value)} />
          <h2 className="text-xl font-semibold mt-4">Ausgaben</h2>
          <Label>Monatliche Ausgaben gesamt</Label>
          <Input type="number" value={ausgaben} onChange={(e) => setAusgaben(+e.target.value)} />
        </CardContent>
      </Card>
        <Card>
        <CardContent className="grid gap-2 p-4">
          <h2 className="text-xl font-semibold">Kredit</h2>
          <Label>Kreditsumme (€)</Label>
          <Input type="number" value={kreditsumme} onChange={(e) => setKreditsumme(+e.target.value)} />
          <Label>Zinssatz p.a. (%)</Label>
          <Input type="number" value={zins} onChange={(e) => setZins(+e.target.value)} />
          <Label>Zinsbindung (Jahre)</Label>
          <Input type="number" value={zinsbindung} onChange={(e) => setZinsbindung(+e.target.value)} />
          <Label>Tilgung p.a. (%)</Label>
          <Input type="number" value={tilgungProzent.toFixed(2)} onChange={(e) => handleTilgungProzentChange(e.target.value)} />
          <Label>Tilgung pro Monat (€)</Label>
          <Input type="number" value={tilgungEuro} onChange={(e) => handleTilgungEuroChange(e.target.value)} />

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Sondertilgungen</h3>
            {sondertilgungen.map((s, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-end mb-2">
                <div>
                  <Label>Startjahr</Label>
                  <Input type="number" value={s.start} onChange={(e) => updateSondertilgung(i, 'start', e.target.value)} />
                </div>
                <div>
                  <Label>Dauer (Jahre)</Label>
                  <Input type="number" value={s.dauer} onChange={(e) => updateSondertilgung(i, 'dauer', e.target.value)} />
                </div>
                <div>
                  <Label>Betrag (€)</Label>
                  <Input type="number" value={s.betrag} onChange={(e) => updateSondertilgung(i, 'betrag', e.target.value)} />
                </div>
                <Button variant="destructive" onClick={() => removeSondertilgung(i)}>Entfernen</Button>
              </div>
            ))}
            <Button onClick={addSondertilgung}>+ Sondertilgung hinzufügen</Button>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Card>
  <CardContent className="p-4 space-y-2">
    <h2 className="text-xl font-semibold text-green-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>Einnahmen & Ausgaben</h2>
    <p><strong>Gesamteinnahmen:</strong> {gesamtEinkommen.toLocaleString()} € / Monat</p>
    <p><strong>Monatliche Ausgaben (ohne Kredit):</strong> {ausgaben.toLocaleString()} €</p>
    <p><strong>Monatliche Kreditrate:</strong> {monatlicheRate.toLocaleString()} €</p>
    <p><strong>Verfügbar nach Kredit & Ausgaben:</strong> {uebrig.toLocaleString()} €</p>
  </CardContent>
</Card>

<Card>
  <CardContent className="p-4 space-y-2">
    <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 6h18M3 14h18M3 18h18" /></svg>Kredit & Zinsdetails</h2>
    <p><strong>Gesamtlaufzeit:</strong> {monate} Monate</p>
    <p><strong>Gesamtkosten:</strong> {gesamtkosten.toLocaleString()} €</p>
    <p><strong>Restschuld nach {zinsbindung} Jahren:</strong> {restschuldNachZinsbindung.toLocaleString()} €</p>
    <p><strong>Gezahlte Zinsen bis dahin:</strong> {zinsenBisZinsbindung.toLocaleString()} €</p>
  </CardContent>
</Card>
</div>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Restschuldverlauf</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tilgungsverlauf}>
              <ReferenceLine x={zinsbindung} stroke="red" strokeDasharray="4 2" label="Zinsbindung" />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Jahr" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Restschuld" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Zins/Tilgung Verhältnis (monatlich)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={zahlungsverlauf}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Monat" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="Zinsen" stroke="#ff7300" strokeWidth={1} />
              <Line type="monotone" dataKey="Tilgung" stroke="#387908" strokeWidth={1} />
              <Line type="monotone" dataKey="Gesamt" stroke="#8884d8" strokeWidth={1} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
