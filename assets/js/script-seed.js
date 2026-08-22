/*
 * The per-day video scripts that auto-fill the Script Studio.
 *
 * SCRIPT_SEED ships with Day 1 filled in as a real, working example.
 * Everything else gets added by hand or imported via "Import Script JSON"
 * in admin-scripts.html — imported scripts are merged into this seed and
 * saved in this browser's localStorage, since a static site has nowhere
 * server-side to write to.
 */

const SCRIPT_SEED = {
  1: {
    day: 1,
    episodeRef: '',
    hook: "Nobody warns you that the hardest part of surveying isn't the instrument, it's the client call before you even touch it.",
    relatable: "Every surveyor has sat through that first call, nodding along while mentally re-scoping the whole job.",
    scenes: [
      { visual: 'Phone ringing on a cluttered desk, survey plans in the background', line: "Client's calling. Here we go." },
      { visual: 'Close-up, answering the call, half-smiling', line: "\"Yeah, we can definitely look at that boundary for you.\"" },
      { visual: 'Cut to writing down site details on a notepad', line: 'Getting the real details, not just what they think they need.' },
      { visual: 'Ending the call, exhaling, looking at the notes', line: "This is where every job actually starts." },
    ],
    cta: 'Follow for Day 002: sending the invoice.',
    caption: "Day 001 of building GeoTechieX in public. Every plan starts with a call nobody films. #PutYourselfOnTheMap #BuildInPublic",
    hashtags: ['#PutYourselfOnTheMap', '#Surveying', '#BuildInPublic'],
  },
};

window.BFZScripts = {
  SCRIPT_SEED,
};
