// The Community Series archive. Add one new arc entry to the TOP of this
// array to publish a new current challenge; the top entry (highest `order`)
// is always shown as "Current Challenge" on community-series.html, the rest
// as past series.
const COMMUNITY_SERIES = [
  {
    order: 1,
    seriesName: 'Put Yourself On The Map',
    hashtag: '#PutYourselfOnTheMap',
    arcTitle: 'How We Get Each Point on a Survey Plan',
    arcHook: 'The struggle to get your plan ready.',
    episodes: [
      { title: 'The Client Call', prompt: "Tell the story of the call that kicks it all off. What does the client ask for, and what do you already know you're in for?" },
      { title: 'Sending the Invoice', prompt: 'Walk through quoting and invoicing the job. What actually goes into that number?' },
      { title: 'Mobilization Fee Clears', prompt: 'The fee lands. Show what happens next: getting the instrument ready and the team briefed.' },
      { title: 'Reconnaissance', prompt: 'First trip to site before the real work starts. What are you actually checking for?' },
      { title: 'Clearing the Site', prompt: 'Sometimes the site fights back before you even set up. Show what it takes to clear a path.' },
      { title: 'Carrying the Pillar to Site', prompt: 'The pillar has to get to site no matter how far or how rough the terrain. Show the trek.' },
      { title: 'Digging the Ground', prompt: 'Before a beacon means anything, someone has to dig. Show the physical work most people never see.' },
      { title: 'Observation with the Instrument', prompt: 'Show the actual reading: setting up, sighting, and taking the observation that becomes the raw data.' },
      { title: 'Processing the Data', prompt: 'Take us from field numbers to something usable. What does that desk work actually look like?' },
      { title: 'Drawing the Plan', prompt: "Show the moment the data becomes a drawing. What's the most painstaking part of getting it right?" },
      { title: 'Delivered to the Client', prompt: 'Show the handoff. What does the client actually see, and what did they never realize went into it?' },
      { title: 'The Plan in Use', prompt: 'Show what happens after delivery: a bank, a lawyer, an engineer, a government office, actually using what you made.' },
    ],
  },
];
