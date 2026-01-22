# Onderhoudsgids Procesmodel Vastgoed Nederland

Dit document beschrijft hoe het procesmodel wordt onderhouden: hoe je nodes wijzigt, modules toevoegt en versies beheert.

---

## 1. Structuur van het model

Het model bestaat uit de volgende onderdelen:

```
src/
├── types/
│   └── process-model.ts      # TypeScript type definities
└── data/
    ├── modules.json          # Module definities en swimlanes
    ├── nodes-*.json          # Processtappen per fase
    ├── edges.json            # Verbindingen tussen nodes
    ├── rolweergave.json      # Overzicht per rol
    └── reglement-mapping.json # Koppeling naar reglementen
```

---

## 2. Een bestaande node wijzigen

### Stap 1: Vind de juiste file
Nodes zijn gegroepeerd per procesfase:
- `nodes-leadgeneratie.json` → LEAD-001 t/m LEAD-005
- `nodes-aanvraag.json` → AANV-001 t/m AANV-007
- `nodes-activatie.json` → ACT-001 t/m ACT-004
- `nodes-lopend.json` → LID-001, WIJZ-001 t/m WIJZ-004
- `nodes-contributie.json` → CONTR-001 t/m CONTR-006
- `nodes-gilde.json` → GILDE-001 t/m GILDE-005
- `nodes-beeindiging.json` → BEEIN-001 t/m BEEIN-007
- `nodes-escalaties.json` → ESC-001 t/m ESC-007

### Stap 2: Wijzig de node
Open de relevante file en pas de gewenste velden aan.

### Stap 3: Update versiebeheer
Bij elke wijziging moet je de `versie` sectie bijwerken:

```json
"versie": {
  "versie": "1.1.0",           // Verhoog versienummer
  "eigenaar": "ledenadministrateur",
  "eigenaarAfdeling": "ledenadministratie",
  "aanmaakDatum": "2025-01-15",
  "laatstGewijzigd": "2025-06-01",  // Nieuwe datum
  "status": "actief",
  "wijzigingsnotities": "RACI aangepast: Finance nu C ipv I"
}
```

### Versienummering
- **Major (x.0.0)**: Fundamentele wijziging in processtap
- **Minor (1.x.0)**: Toevoeging of aanpassing van acties/outputs
- **Patch (1.0.x)**: Tekstuele correcties, kleine verduidelijkingen

---

## 3. Een nieuwe node toevoegen

### Stap 1: Bepaal de node ID
Gebruik het patroon `[FASE]-[NNN]`:
- LEAD = Leadgeneratie
- AANV = Aanvraag
- ACT = Activatie
- LID = Lopend lidmaatschap
- WIJZ = Wijzigingen
- CONTR = Contributie
- GILDE = Gilde-beheer
- BEEIN = Beëindiging
- ESC = Escalaties

Nummer door vanaf het hoogste bestaande nummer in die fase.

### Stap 2: Maak de node aan
Kopieer een bestaande node als template en vul alle verplichte velden in:

```json
{
  "id": "WIJZ-005",
  "titel": "Korte, duidelijke titel",
  "korteBeschrijving": "Wat doet deze stap in één zin",
  "klantreisStatus": "lid",
  "procesFase": "wijzigingen",
  "casusType": "standaard",
  "primaireAfdeling": "ledenadministratie",
  "raci": [...],
  "trigger": "Wat start deze stap",
  "inputs": [...],
  "acties": [...],
  "outputs": [...],
  "handovers": [...],
  "uitzonderingen": [...],
  "registraties": [...],
  "reglementReferenties": [...],
  "versie": {
    "versie": "1.0.0",
    "eigenaar": "rol-naam",
    "eigenaarAfdeling": "afdeling",
    "aanmaakDatum": "YYYY-MM-DD",
    "laatstGewijzigd": "YYYY-MM-DD",
    "status": "concept"
  },
  "module": "basis",
  "tags": [...]
}
```

### Stap 3: Voeg edges toe
Open `edges.json` en voeg verbindingen toe:

```json
{
  "id": "E200",
  "van": "WIJZ-004",
  "naar": "WIJZ-005",
  "label": "Beschrijving van de transitie",
  "type": "standaard"
}
```

Edge types:
- `standaard` - normale doorstroom
- `uitzondering` - afwijkende route
- `escalatie` - escalatie naar andere afdeling
- `terugkoppeling` - terug naar eerder punt in proces

### Stap 4: Update rolweergave
Als de node nieuwe taken voor een rol introduceert, voeg deze toe aan `rolweergave.json`.

### Stap 5: Update reglement-mapping
Als de node refereert aan reglementen, voeg deze toe aan `reglement-mapping.json`.

---

## 4. Een nieuwe module toevoegen

Modules groeperen gerelateerde processen die aan/uit kunnen. Gebruik dit voor:
- Nieuwe gilden
- Optionele features
- Pilots

### Stap 1: Definieer de module
Voeg toe aan `modules.json`:

```json
{
  "id": "gilde-beheerders",
  "naam": "Gilde Beheerders",
  "beschrijving": "Processen voor het Gilde van Beheerders",
  "actief": false,
  "afhankelijkheden": ["basis"],
  "versie": "1.0.0"
}
```

### Stap 2: Maak module-specifieke nodes
Maak een nieuw bestand `nodes-gilde-beheerders.json` met nodes die alleen voor deze module gelden. Zet bij elke node:

```json
"module": "gilde-beheerders"
```

### Stap 3: Koppel aan basis
Voeg edges toe die de nieuwe module verbinden met bestaande nodes.

---

## 5. Versiebeheer best practices

### Status flow
```
concept → actief → vervallen
```

- **concept**: Nieuw, nog niet goedgekeurd
- **actief**: In gebruik
- **vervallen**: Niet meer geldig, bewaard voor historie

### Bij grote wijzigingen
1. Zet oude node op status `vervallen`
2. Maak nieuwe node met nieuw ID (bijv. AANV-003-v2)
3. Update alle edges naar de nieuwe node
4. Documenteer in wijzigingsnotities waarom

### Changelog bijhouden
Houd een changelog bij in de root:

```markdown
# Changelog

## 2025-06-01
- AANV-003: RACI aangepast, Finance nu Consulted
- WIJZ-005: Nieuwe node toegevoegd voor adreswijziging buitenland

## 2025-05-15
- Module gilde-beheerders toegevoegd (inactief)
```

---

## 6. Filters gebruiken

Het model ondersteunt filters op:

| Filter | Waarden | Gebruik |
|--------|---------|---------|
| `klantreisStatus` | lead, prospect, aanvrager, lid, opzegger, ex-lid | Focus op fase klantreis |
| `procesFase` | leadgeneratie, intake, aanvraag, beoordeling, activatie, onboarding, lopend-lidmaatschap, contributie, gilde-beheer, wijzigingen, beeindiging, escalatie | Focus op procesgebied |
| `casusType` | standaard, uitzondering, escalatie | Toon alleen uitzonderingen |
| `primaireAfdeling` | sales, ledenadministratie, legal, finance, etc. | Focus op één afdeling |
| `module` | basis, gilde-makelaars, tuchtrecht, etc. | Toon/verberg modules |

---

## 7. Validatie checklist

Voordat je wijzigingen publiceert:

- [ ] Alle verplichte velden zijn ingevuld
- [ ] Node ID volgt naamconventie
- [ ] Versie is bijgewerkt
- [ ] Handovers verwijzen naar bestaande node IDs
- [ ] Edges zijn consistent (elke handover heeft een edge)
- [ ] RACI is volledig (minimaal één R en één A)
- [ ] Registraties zijn specifiek (systeem + actie)
- [ ] Reglementreferenties zijn correct
- [ ] Rolweergave is bijgewerkt indien nodig
- [ ] Module verwijzing klopt

---

## 8. Veelvoorkomende fouten

| Fout | Oplossing |
|------|-----------|
| Edge verwijst naar niet-bestaande node | Controleer of node ID exact overeenkomt |
| Dubbele node IDs | Elk ID moet uniek zijn in het hele model |
| Missende RACI | Elke node moet minimaal R en A hebben |
| Circulaire edges | Vermijd oneindige loops, behalve bij expliciete terugkoppelingen |
| Vergeten versie-update | Altijd `laatstGewijzigd` bijwerken |

---

## 9. Contact

Vragen over het model of de structuur? Neem contact op met:
- Proceseigenaar: [invullen]
- Technisch beheer: [invullen]
