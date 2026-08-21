/*
 * The per-day quote plans that auto-fill the Content Studio's Quote
 * section (used by the Day Poster and Quote Slide generators).
 *
 * DAY_PLANS_SEED ships with Day 1 filled in as a real, working example.
 * Everything else you add either by hand or by importing JSON via the
 * "Import Day Plan(s)" panel in admin.html — imported plans are merged
 * into this seed and saved in this browser's localStorage, since a
 * static site has nowhere server-side to write to.
 */

const DAY_PLANS_SEED = {
  1: {
    day: 1,
    quote: "You don't have to be great to start, but you have to start to be great.",
    highlight: 'START',
    tagline: 'Registered surveyor & DevOps engineer, building live.',
    focusLines: ['Set the foundation.', 'Build the habit.', 'Trust the process.'],
    log: {
      title: 'Shipped the GeoTechieX landing page',
      summary: 'Designed and built this site from zero: services, live tools, process, FAQ, and this log itself, so daily build-in-public updates have a home from day one.',
      tags: ['Web Dev', 'Build in Public'],
    },
  },
};

window.BFZDayPlans = {
  DAY_PLANS_SEED,
};
