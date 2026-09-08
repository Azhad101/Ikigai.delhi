/**
 * IKIGAI.DELHI — Centralized Event Configuration
 * 
 * ORGANIZERS: Update event details here. 
 * All UI sections automatically reflect changes made in this file.
 */

export const eventConfig = {
  name: "Ikigai.delhi",
  shortName: "Ikigai.delhi",
  tagline: "Find what drives you. Build what matters.",
  subTagline: "A hackathon for people who don't just want to build something, but want to discover why they're building it.",
  philosophyQuote: "Ikigai isn't something you find in 24 hours. It's something you begin discovering.",
  
  // Event Logistics — To Be Announced placeholders as required
  dateDisplay: "To Be Announced",
  dateIso: null, // Example when finalized: "2026-11-14T09:00:00+05:30"
  venue: "To Be Announced (Delhi NCR)",
  mode: "In-Person / Hybrid (To Be Announced)",
  teamSize: "2 – 4 Builders",
  eligibility: "Open to all students, developers, designers, and tech enthusiasts",
  registrationFee: "100% Free (Zero Registration Fee)",
  
  // External Links & Registration
  registrationStatus: "Announcing Soon", // "Open" | "Announcing Soon" | "Closed"
  registrationUrl: "#register", // Replace with Devfolio, Unstop, or official link when live
  sponsorBrochureUrl: "mailto:contact@ikigai.delhi?subject=Sponsorship%20Inquiry%20-%20IKIGAI.DELHI",
  
  // Community & Socials
  discordUrl: "#", // Add link when finalized
  telegramUrl: "#", // Add link when finalized
  githubUrl: "https://github.com",
  twitterUrl: "#",
  instagramUrl: "#",
  linkedinUrl: "#",
  
  // Organizer Contact
  contactEmail: "contact@ikigai.delhi",
  pressEmail: "press@ikigai.delhi",
  locationName: "Delhi NCR, India",
  
  // Feature Toggles
  features: {
    enableCountdown: false, // Automatically turns true if dateIso is a valid future timestamp
    enableTerminalEasterEgg: true,
    enableKonamiCode: true,
  }
};
