export type SiteContentValue = Record<string, unknown>
export type SiteContentMap = Record<string, Record<string, SiteContentValue>>

export const defaultSiteContent = {
  site: {
    seo: {
      title: "Fab 50s & 60s Nostalgia Car Club | Long Island",
      description:
        "Join Long Island's friendliest car club! We welcome ALL makes, models, and years. Classic, modern, muscle, import - if you love cars, you belong here.",
    },
  },
  global: {
    identity: {
      brandTitle: "Fab 50s & 60s",
      brandSubtitle: "Nostalgia Car Club",
      logoAlt: "Fab 50s & 60s Nostalgia Car Club",
      joinLabel: "Join the Club",
      footerDescription:
        "Long Island's friendliest car club, welcoming enthusiasts of ALL makes, models, and years since 1989. If you love cars, you belong here.",
      footerLocation: "Long Island, New York",
      copyrightName: "Fabulous 50s & 60s Nostalgia Car Club",
    },
    contact: {
      email: "fab5060carclub@gmail.com",
      facebookUrl: "https://facebook.com/fab5060carclub",
      facebookLabel: "Facebook - Fab 50s & 60s Car Club",
      meetingTitle: "Monthly Meetings",
      meetingLines: [
        "Second Thursday of Every Month",
        "7:00 PM",
        "Seaport Diner",
        "Port Jefferson Station, NY",
      ],
      meetingNote: "Visitors always welcome!",
    },
  },
  homepage: {
    hero: {
      badge: "Long Island's Friendliest Car Club",
      title: "Where Car Lovers",
      titleHighlight: "Come Together",
      description:
        "Whether you drive a classic '57 Chevy, a modern muscle car, or anything in between - ALL makes, models, and years are welcome. Join our community of passionate car enthusiasts.",
      primaryCta: "Become a Member",
      secondaryCta: "View Upcoming Events",
      stats: [
        { value: "100+", label: "Members" },
        { value: "30+", label: "Events/Year" },
        { value: "35+", label: "Years Strong" },
      ],
    },
    about: {
      title: "More Than Just a Car Club",
      description:
        "Founded over 35 years ago on Long Island, we've grown into a tight-knit community united by our love of automobiles. While our name celebrates the golden era of the 50s and 60s, our garage doors are open to every vehicle and every enthusiast.",
      features: [
        {
          title: "All Cars Welcome",
          description:
            "From vintage classics to modern marvels, hot rods to imports - if you love your car, we want to see it.",
        },
        {
          title: "Family Friendly",
          description: "We're a welcoming community for enthusiasts of all ages. Bring the whole family to our events!",
        },
        {
          title: "Community First",
          description: "Beyond cars, we're about friendships. Many members have been with us for decades.",
        },
        {
          title: "Fun Events",
          description: "Car shows, cruises, picnics, holiday parties, and more. There's always something happening.",
        },
      ],
      calloutTitle: "Don't Have a Classic Car?",
      calloutDescription:
        "No problem! Many of our members drive daily drivers to meetings and events. What matters is your passion for cars, not what's in your garage. Everyone is welcome.",
    },
    events: {
      title: "Upcoming Events",
      description: "Don't miss what's coming up this season",
      buttonLabel: "Full Calendar",
    },
    gallery: {
      title: "Club Gallery",
      description: "Check out highlights from our events and the amazing cars our members bring",
      buttonLabel: "View Full Gallery",
    },
    membership: {
      badge: "Membership",
      title: "Join Our Family",
      description:
        "Become a member of Long Island's most welcoming car club. Whether you're a seasoned collector or just getting started, there's a place for you here.",
      benefits: [
        "Monthly club meetings with fellow enthusiasts",
        "Exclusive cruise nights and car shows",
        "Annual BBQ and holiday parties",
        "Club newsletter and event updates",
        "Discounts at participating auto shops",
        "Voting rights on club activities",
        "Official club merchandise",
        "Access to our member network for advice and help",
      ],
      price: "$35",
      priceSuffix: "/year",
      priceNote: "Per household",
      cardNote: "One low price covers your entire household. Bring the whole family to events!",
      ctaLabel: "Apply for Membership",
      footerNote: "Come to a meeting first - we'd love to meet you!",
    },
    contact: {
      title: "Get In Touch",
      description: "Have questions? Want to learn more? We'd love to hear from you!",
      meetingTitle: "Meeting Location",
      meetingLines: ["Seaport Diner", "Port Jefferson Station, NY", "Second Thursday of every month at 7:00 PM"],
      emailTitle: "Email Us",
      facebookTitle: "Follow Us",
      facebookDescription: "See event photos and updates",
      formTitle: "Send Us a Message",
      formDescription: "Fill out the form below and we'll get back to you soon.",
      successTitle: "Message Sent!",
      successDescription: "Thanks for reaching out. We'll get back to you soon.",
      sendAnotherLabel: "Send Another Message",
      submitLabel: "Send Message",
      submittingLabel: "Sending...",
    },
  },
  aboutPage: {
    main: {
      title: "About Our Club",
      intro:
        "The Fabulous 50s and 60s Nostalgia Car Club has been bringing together car enthusiasts on Long Island for over 30 years. What started as a small group of classic car lovers has grown into one of the most welcoming automotive communities in the area.",
      introSecond:
        "While our name pays tribute to the golden era of American automobiles, we welcome ALL makes, models, and years. Whether you drive a pristine 1957 Chevy, a restored muscle car, a modern sports car, or a beloved daily driver with character - you are welcome here.",
      primaryCta: "See Our Events",
      secondaryCta: "Join Today",
      stats: [
        { label: "Years Active", value: "30+" },
        { label: "Active Members", value: "100+" },
        { label: "Events Per Year", value: "50+" },
        { label: "Cars Welcome", value: "All" },
      ],
      valuesTitle: "What We're All About",
      valuesDescription: "More than just a car club - we're a community",
      values: [
        {
          title: "All Cars Welcome",
          description:
            "From classic 50s and 60s beauties to modern muscle cars, imports, customs, and everything in between. If you love cars, you belong here.",
        },
        {
          title: "Family Friendly",
          description:
            "We're a family-oriented club. Bring your kids, grandkids, and loved ones to our events.",
        },
        {
          title: "Community First",
          description:
            "We support local charities, participate in community parades, and give back to Long Island.",
        },
        {
          title: "Long Island Proud",
          description:
            "Based right here on Long Island, we cruise local roads, support local businesses, and celebrate our home.",
        },
      ],
      meetingTitle: "Monthly Meetings",
      meetingDescription:
        "We meet on the second Thursday of every month at 7:00 PM at the Seaport Diner in Port Jefferson Station. Meetings are casual, friendly, and a great way to connect with fellow car enthusiasts.",
      historyTitle: "Our History",
      historyParagraphs: [
        "Founded by a group of friends who shared a passion for classic cars, our club has grown and evolved while staying true to our core mission: bringing car lovers together.",
        "Over the decades, we've hosted countless car shows, raised money for local charities, and created lifelong friendships.",
      ],
      ctaTitle: "Ready to Join the Fun?",
      ctaDescription:
        "Membership includes you and your immediate family. Come to a meeting, check out an event, and see what we're all about!",
    },
  },
  membershipPage: {
    main: {
      title: "Join the Club",
      description:
        "We are delighted you are considering joining the Fabulous 50's & 60's Nostalgia Car Club. On behalf of the Board of Directors - Welcome!",
      aboutTitle: "About Our Club",
      aboutParagraphs: [
        "The Fabulous 50's and 60's Nostalgia Car Club, Inc. is dedicated to promoting friendship and camaraderie for all persons who appreciate classic, antique, customized, and special-interest vehicles. We do not just accept 50's and 60's vehicles - all makes and models are welcome.",
        "We are a not-for-profit corporation and support many community and national charities, as well as other Long Island car clubs.",
      ],
      benefitsTitle: "What You Get",
      benefits: [
        "Club logo shirt or hat (one per person)",
        "Club Roster with all member contacts",
        "Copy of Club By-Laws",
        "Full car show schedule for the year",
        "Access to all club events and cruise nights",
      ],
      participationTitle: "Member Participation",
      participationDescription:
        "We are a hands-on club. Member participation keeps our club thriving.",
      expectations: [
        "Get donations for show raffles",
        "Sell raffle and 50/50 tickets at events",
        "Park and stage cars at shows",
        "Judge cars at our shows",
        "Help with setup and cleanup at car shows",
      ],
      applicationUrl: "https://fab5060carclub.com/wp-content/uploads/2024/01/club-application-form-pdf.pdf",
      questionsTitle: "Questions?",
      questionsDescription: "Our club secretary is happy to help answer any questions about membership.",
      secretaryName: "Cathleen T. Somma, Club Secretary",
      secretaryPhone: "(631) 926-2554",
    },
  },
  contactPage: {
    main: {
      title: "Contact Us",
      description: "Have questions? We'd love to hear from you!",
      meetingLocationTitle: "Meeting Location",
      meetingLocationLines: ["Seaport Diner", "Port Jefferson Station, NY"],
      meetingTimeTitle: "Meeting Time",
      meetingTimeLines: ["7:00 PM", "Second Thursday Monthly", "Visitors and prospective members always welcome!"],
      formTitle: "Send Us a Message",
      successTitle: "Message Sent!",
      successDescription: "Thank you for reaching out. We'll get back to you soon!",
      faqTitle: "Frequently Asked Questions",
      faqs: [
        {
          question: "Do I need to own a classic car to join?",
          answer:
            "Absolutely not! We welcome ALL cars - classic, modern, import, domestic, custom, stock, or project cars.",
        },
        {
          question: "Can I attend a meeting before joining?",
          answer:
            "Yes! We encourage prospective members to attend a meeting or event before joining.",
        },
      ],
    },
  },
  galleryPage: {
    main: {
      title: "Photo Gallery",
      description: "Memories from our car shows, cruise nights, and club events",
      categories: ["All", "Car Shows", "Cruise Nights", "Member Cars", "Club Events", "Other", "Club Photos"],
      emptyTitle: "No photos yet",
      emptyAllDescription: "The admin can upload photos from the admin panel.",
      emptyCategoryDescription: "No photos in this category yet.",
    },
  },
  boardPage: {
    main: {
      title: "Board of Directors",
      description:
        "Meet the dedicated volunteers who keep the Fabulous 50s & 60s Nostalgia Car Club running. Our board is elected by the membership and serves the entire club community.",
      officersTitle: "Club Officers",
      emptyOfficersText: "No board members listed yet.",
      contactTitle: "Contact a Board Member",
      contactDescription:
        "You can reach any board member by phone using the contact information above. For general club inquiries, please visit our Contact page or attend a monthly meeting to speak with board members in person.",
      committeesTitle: "Club Committees",
      committees: [
        {
          name: "Car Show Committee",
          description:
            "Plans and executes all club-hosted and judged car shows. Handles staging, judging, trophies, and vendor coordination.",
        },
        {
          name: "Cruise Night Committee",
          description:
            "Organizes club cruise nights and helps coordinate member gatherings during the season.",
        },
        {
          name: "Membership Committee",
          description:
            "Welcomes new members, processes applications, and ensures a positive experience for all club members.",
        },
        {
          name: "Charity & Community",
          description:
            "Coordinates the club's participation in charity car shows, fundraisers, and community events across Long Island.",
        },
      ],
      meetingTitle: "Attend a Meeting",
      meetingDescription:
        "The best way to meet the board is to come to a monthly meeting. Meetings are held the second Thursday of every month at Seaport Diner, 5045 Nesconset Hwy, Port Jefferson Station, NY starting at 7:00 PM.",
    },
  },
  memoriamPage: {
    main: {
      title: "In Memoriam",
      description:
        "We honor and remember the members of the Fab 50s & 60s Nostalgia Car Club who have passed on. They were part of our family, and their memory lives on in every mile we drive.",
      quote: "Those we love don't go away - they drive beside us every day.",
      emptyText: "No entries yet.",
      tributeRequest:
        "If you would like to add a tribute for a fellow club member who has passed away, please reach out to us on our Contact page. We want to make sure no one is forgotten.",
    },
  },
} satisfies SiteContentMap

export function mergeSiteContent(content: SiteContentMap): SiteContentMap {
  const merged: SiteContentMap = structuredClone(defaultSiteContent)

  for (const [section, entries] of Object.entries(content)) {
    merged[section] ??= {}
    for (const [key, value] of Object.entries(entries)) {
      const normalizedValue = normalizeLegacyContent(section, key, value)
      merged[section][key] = {
        ...(merged[section][key] ?? {}),
        ...normalizedValue,
      }
    }
  }

  return merged
}

function normalizeLegacyContent(section: string, key: string, value: SiteContentValue) {
  if (section === "homepage" && key === "hero" && "subtitle" in value && !("titleHighlight" in value)) {
    return {
      ...value,
      badge: value.subtitle,
      titleHighlight: "",
    }
  }

  return value
}
