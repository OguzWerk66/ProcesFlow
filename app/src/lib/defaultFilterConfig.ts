import type { FilterConfig } from '../types/filterConfig';

// Standaard filter configuratie gebaseerd op de huidige hardcoded waarden
// Deze wordt gebruikt als er nog geen configuratie in localStorage staat

export const defaultFilterConfig: FilterConfig = {
  fases: {
    id: 'fases',
    naam: 'Fases',
    beschrijving: 'De 4 hoofdfasen van de klantreis',
    opties: [
      {
        id: 'bereiken',
        label: 'Bereiken',
        beschrijving: 'Marketing - nieuwe leden aantrekken',
        kleur: '#E8F5E9',
        volgorde: 1,
        actief: true,
      },
      {
        id: 'boeien',
        label: 'Boeien',
        beschrijving: 'Interesse wekken en vasthouden',
        kleur: '#FFF3E0',
        volgorde: 2,
        actief: true,
      },
      {
        id: 'binden',
        label: 'Binden',
        beschrijving: 'Lidmaatschap activeren',
        kleur: '#E3F2FD',
        volgorde: 3,
        actief: true,
      },
      {
        id: 'behouden',
        label: 'Behouden',
        beschrijving: 'Campagnes, Webinars, Connect, Wijzigingen',
        kleur: '#F3E5F5',
        volgorde: 4,
        actief: true,
      },
    ],
  },

  afdelingen: {
    id: 'afdelingen',
    naam: 'Afdelingen',
    beschrijving: 'Afdelingen binnen de organisatie',
    opties: [
      {
        id: 'sales',
        label: 'Sales',
        kleur: '#FFF3E0',
        volgorde: 1,
        actief: true,
      },
      {
        id: 'ledenadministratie',
        label: 'Ledenadministratie',
        kleur: '#E8F5E9',
        volgorde: 2,
        actief: true,
      },
      {
        id: 'legal',
        label: 'Legal',
        kleur: '#FCE4EC',
        volgorde: 3,
        actief: true,
      },
      {
        id: 'finance',
        label: 'Finance',
        kleur: '#F3E5F5',
        volgorde: 4,
        actief: true,
      },
      {
        id: 'marcom',
        label: 'MarCom',
        kleur: '#E0F7FA',
        volgorde: 5,
        actief: true,
      },
      {
        id: 'it',
        label: 'IT',
        kleur: '#ECEFF1',
        volgorde: 6,
        actief: true,
      },
      {
        id: 'deelnemingen',
        label: 'Deelnemingen',
        kleur: '#EFEBE9',
        volgorde: 7,
        actief: true,
      },
      {
        id: 'bestuur',
        label: 'Bestuur',
        kleur: '#FFEBEE',
        volgorde: 8,
        actief: true,
      },
    ],
  },

  klantreisStatussen: {
    id: 'klantreisStatussen',
    naam: 'Klantreis Status',
    beschrijving: 'Status van de klant in de klantreis',
    opties: [
      {
        id: 'lead',
        label: 'Lead',
        kleur: '#E3F2FD',
        volgorde: 1,
        actief: true,
      },
      {
        id: 'prospect',
        label: 'Prospect',
        kleur: '#BBDEFB',
        volgorde: 2,
        actief: true,
      },
      {
        id: 'aanvrager',
        label: 'Aanvrager (nieuw)',
        kleur: '#90CAF9',
        volgorde: 3,
        actief: true,
      },
      {
        id: 'aanvrager-bestaand',
        label: 'Aanvrager (bestaand lid)',
        kleur: '#64B5F6',
        volgorde: 4,
        actief: true,
      },
      {
        id: 'lid',
        label: 'Lid',
        kleur: '#4CAF50',
        volgorde: 5,
        actief: true,
      },
      {
        id: 'opzegger',
        label: 'Opzegger',
        kleur: '#FF9800',
        volgorde: 6,
        actief: true,
      },
      {
        id: 'ex-lid',
        label: 'Ex-lid',
        kleur: '#9E9E9E',
        volgorde: 7,
        actief: true,
      },
    ],
  },

  procesFases: {
    id: 'procesFases',
    naam: 'Procesfases',
    beschrijving: 'Fases in het procesverloop',
    opties: [
      {
        id: 'leadgeneratie',
        label: 'Leadgeneratie',
        volgorde: 1,
        actief: true,
      },
      {
        id: 'intake',
        label: 'Intake',
        volgorde: 2,
        actief: true,
      },
      {
        id: 'aanvraag',
        label: 'Aanvraag',
        volgorde: 3,
        actief: true,
      },
      {
        id: 'beoordeling',
        label: 'Beoordeling',
        volgorde: 4,
        actief: true,
      },
      {
        id: 'activatie',
        label: 'Activatie',
        volgorde: 5,
        actief: true,
      },
      {
        id: 'onboarding',
        label: 'Onboarding',
        volgorde: 6,
        actief: true,
      },
      {
        id: 'lopend-lidmaatschap',
        label: 'Lopend lidmaatschap',
        volgorde: 7,
        actief: true,
      },
      {
        id: 'wijzigingen',
        label: 'Wijzigingen',
        volgorde: 8,
        actief: true,
      },
      {
        id: 'beeindiging',
        label: 'Beëindiging',
        volgorde: 9,
        actief: true,
      },
    ],
  },
};
