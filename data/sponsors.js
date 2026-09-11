/**
 * IKIGAI.DELHI — Controlled Sponsor & Community Alliance System
 * 
 * STRICT PROTOCOL:
 * - Unannounced commercial tiers strictly display "TO BE ANNOUNCED".
 * - Zero fictional sponsors or logos.
 * - Community partners (e.g. German Crab) are explicitly segregated under COMMUNITY ALLIANCE.
 */

export const sponsorSystem = [
  {
    tierLabel: "POWERED BY",
    tierNote: "Principal Infrastructure & Ecosystem Partner",
    slots: [
      {
        name: "TO BE ANNOUNCED",
        state: "SLOT OPEN",
        isAnnounced: false,
        url: "#contact"
      }
    ]
  },
  {
    tierLabel: "SUPPORTED BY",
    tierNote: "Core Developer Platforms & Cloud Providers",
    slots: [
      {
        name: "TO BE ANNOUNCED",
        state: "SLOT OPEN",
        isAnnounced: false,
        url: "#contact"
      },
      {
        name: "TO BE ANNOUNCED",
        state: "SLOT OPEN",
        isAnnounced: false,
        url: "#contact"
      }
    ]
  },
  {
    tierLabel: "TOOLING & BOUNTY PARTNERS",
    tierNote: "Specialized Developer Toolchains & APIs",
    slots: [
      {
        name: "TO BE ANNOUNCED",
        state: "SLOT OPEN",
        isAnnounced: false,
        url: "#contact"
      },
      {
        name: "TO BE ANNOUNCED",
        state: "SLOT OPEN",
        isAnnounced: false,
        url: "#contact"
      },
      {
        name: "TO BE ANNOUNCED",
        state: "SLOT OPEN",
        isAnnounced: false,
        url: "#contact"
      }
    ]
  }
];

export const communityAlliance = [
  {
    name: "German Crab",
    type: "FEATURED COMMUNITY PARTNER",
    role: "Developer ecosystem powering builders & open-source collaboration in Delhi.",
    icon: "assets/sponsors/german-crab-icon.png",
    code: "GERMAN_CRAB",
    featured: true,
    url: "#"
  },
  {
    name: "Open Community Alliance",
    type: "INVITATION OPEN",
    role: "Delhi NCR campus technical clubs, hacker houses, and student chapters.",
    icon: "+",
    code: "APPLY // COMMUNITY",
    featured: false,
    url: "#contact"
  }
];

export const sponsorshipInquiry = {
  headline: "PUT YOUR TOOLS INTO THE HANDS OF DELHI'S MOST AMBITIOUS BUILDERS",
  subtext: "Direct engineering brand visibility, API adoption, and technical hiring pipelines across 300+ vetted engineers.",
  email: "ikigai.delhi.kalicoders@gmail.com",
  actionText: "REQUEST PARTNERSHIP PROSPECTUS"
};
