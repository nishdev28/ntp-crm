import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import User from "./src/models/User.js";
import Lead from "./src/models/Lead.js";
import Contact from "./src/models/Contact.js";
import Note from "./src/models/Note.js";
import Task from "./src/models/Task.js";

/* Usage:  node seed.js            -> wipes demo user's data and re-seeds
           node seed.js --destroy  -> removes demo user's data only        */

const DEMO_EMAIL = "alex@timetoprogram.com";
const DEMO_PASSWORD = "password123";

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);
const slug = (s) => s.toLowerCase().replace(/[^a-z]/g, "");
const num = (id) => parseInt(id.slice(1), 10);

// Mock data uses "Social"; the Lead schema enum expects "Social Media"
const SOURCE_MAP = { Social: "Social Media" };

/* ───────────────────────────── Leads ───────────────────────────── */
// [key, name, company, status, priority, source, value, ageDays]
const LEADS = [
  ["l1", "Dribbble Design", "Acme Corp", "New", "High", "Website", 89345, 8],
  ["l2", "Google Pay", "Globex", "Qualified", "High", "Referral", 124000, 20],
  ["l3", "Amazon Shopping", "Initech", "Proposal", "Medium", "Cold Outreach", 32123, 35],
  ["l4", "Stripe", "Umbrella Co", "Won", "High", "Event", 76500, 60],
  ["l5", "Notion", "Soylent", "New", "Low", "Social", 12400, 4],
  ["l6", "Figma", "Hooli", "Qualified", "Medium", "Website", 54000, 14],
  ["l7", "Linear", "Pied Piper", "Proposal", "High", "Referral", 98000, 28],
  ["l8", "Slack", "Vehement", "Lost", "Low", "Cold Outreach", 21000, 95],
  ["l9", "Vercel", "Massive Dynamic", "Won", "High", "Referral", 143000, 110],
  ["l10", "Airtable", "Wayne Ent.", "Qualified", "High", "Event", 67000, 18],
  ["l11", "Datadog", "Stark Industries", "New", "Medium", "Website", 45000, 2],
  ["l12", "Snowflake", "Cyberdyne", "Proposal", "High", "Referral", 152000, 48],
  ["l13", "HubSpot", "Tyrell Corp", "Won", "Medium", "Event", 88000, 150],
  ["l14", "Asana", "Aperture Labs", "Qualified", "Low", "Social", 30000, 22],
  ["l15", "Zoom", "Oscorp", "New", "Medium", "Cold Outreach", 26000, 6],
  ["l16", "GitLab", "LexCorp", "Lost", "Low", "Website", 18000, 70],
  ["l17", "Shopify", "Gringotts", "Qualified", "High", "Referral", 112000, 16],
  ["l18", "Atlassian", "Nakatomi Trading", "Proposal", "Medium", "Website", 58000, 31],
  ["l19", "Twilio", "Duff Beverages", "New", "Low", "Cold Outreach", 14500, 3],
  ["l20", "Cloudflare", "Wonka Industries", "Won", "High", "Referral", 135000, 85],
  ["l21", "MongoDB", "Pendant Publishing", "Qualified", "Medium", "Event", 47000, 11],
  ["l22", "Salesforce", "Rekall", "Lost", "Medium", "Website", 64000, 102],
  ["l23", "Okta", "Gekko & Co", "Proposal", "High", "Referral", 119000, 40],
  ["l24", "Intercom", "Dunder Mifflin", "New", "Medium", "Social", 23500, 5],
  ["l25", "Segment", "Bluth Company", "Qualified", "Low", "Cold Outreach", 19800, 25],
  ["l26", "Mixpanel", "Prestige Worldwide", "Won", "Medium", "Event", 52000, 130],
  ["l27", "Canva", "Sterling Cooper", "New", "High", "Website", 71000, 1],
  ["l28", "Dropbox", "Vandelay Industries", "Lost", "Low", "Social", 16000, 88],
  ["l29", "PagerDuty", "Initrode", "Proposal", "Medium", "Referral", 61000, 33],
  ["l30", "Webflow", "Spacely Sprockets", "Qualified", "High", "Website", 83000, 12],
  ["l31", "Zendesk", "Cogswell Cogs", "New", "Low", "Event", 17500, 7],
  ["l32", "Postman", "Oceanic Airlines", "Won", "High", "Referral", 104000, 75],
  ["l33", "Supabase", "Hanso Foundation", "Qualified", "Medium", "Social", 39000, 19],
  ["l34", "Retool", "Weyland-Yutani", "Proposal", "High", "Cold Outreach", 127000, 44],
  ["l35", "Calendly", "Monarch Solutions", "New", "Medium", "Website", 28500, 9],
  ["l36", "Miro", "Bluesun Corp", "Lost", "Medium", "Event", 41000, 120],
  ["l37", "Plaid", "Umbrella Health", "Qualified", "High", "Referral", 96000, 15],
  ["l38", "Brex", "Tessier-Ashpool", "Proposal", "Low", "Website", 34000, 29],
  ["l39", "Rippling", "Black Mesa", "Won", "High", "Event", 158000, 95],
  ["l40", "Gusto", "Zorg Industries", "New", "Medium", "Cold Outreach", 22000, 4],
];

const buildLead = (owner, [key, name, company, status, priority, source, value, ageDays]) => ({
  owner,
  name,
  email: `${slug(name)}@${slug(company)}.com`,
  phone: `+1 555 0${100 + num(key)}`,
  company,
  status,
  priority,
  source: SOURCE_MAP[source] || source,
  value,
  notes:
    status === "Won"
      ? "Closed — annual contract signed."
      : "Active opportunity in the pipeline.",
  tags: ["saas"],
  order: 0,
  aiSummary: "",
  aiRiskScore: 0,
  createdAt: daysAgo(ageDays),
  updatedAt: daysAgo(Math.max(0, Math.floor(ageDays / 4))),
});

/* ──────────────────────────── Contacts ─────────────────────────── */
// [key, name, title, company, tags, favorite]
const CONTACTS = [
  ["c1", "Olivia Bennett", "VP of Sales", "Acme Corp", ["decision-maker", "warm"], true],
  ["c2", "Noah Carter", "CTO", "Globex", ["technical", "champion"], true],
  ["c3", "Emma Walsh", "Procurement Manager", "Initech", ["finance"], false],
  ["c4", "Liam Foster", "Founder", "Umbrella Co", ["executive"], false],
  ["c5", "Ava Mitchell", "Head of Operations", "Hooli", ["warm"], false],
  ["c6", "Ethan Brooks", "Product Lead", "Pied Piper", ["champion", "technical"], true],
  ["c7", "Sophia Reed", "Marketing Director", "Wayne Ent.", ["influencer"], false],
  ["c8", "Mason Hayes", "CFO", "Cyberdyne", ["finance", "executive"], false],
  ["c9", "Isabella Diaz", "Head of Growth", "Stark Industries", ["vip", "warm"], false],
  ["c10", "Lucas Park", "Engineering Manager", "Tyrell Corp", ["technical"], false],
  ["c11", "Harper Quinn", "Director of IT", "Gringotts", ["technical", "warm"], false],
  ["c12", "Elijah Stone", "COO", "Nakatomi Trading", ["executive"], true],
  ["c13", "Amelia Ross", "Procurement Lead", "Duff Beverages", ["finance"], false],
  ["c14", "James Whitfield", "CEO", "Wonka Industries", ["decision-maker", "vip"], true],
  ["c15", "Charlotte Gray", "Head of Product", "Pendant Publishing", ["champion"], false],
  ["c16", "Benjamin Lee", "VP Engineering", "Rekall", ["technical", "executive"], false],
  ["c17", "Mia Torres", "Finance Director", "Gekko & Co", ["finance", "decision-maker"], false],
  ["c18", "Henry Adams", "Sales Operations Manager", "Dunder Mifflin", ["warm"], false],
  ["c19", "Evelyn Shaw", "Chief of Staff", "Bluth Company", ["executive", "influencer"], false],
  ["c20", "Alexander Kim", "Data Platform Lead", "Prestige Worldwide", ["technical", "champion"], true],
  ["c21", "Grace Nguyen", "Creative Director", "Sterling Cooper", ["influencer", "warm"], false],
  ["c22", "Daniel Murphy", "IT Security Manager", "Vandelay Industries", ["technical"], false],
  ["c23", "Chloe Patel", "Head of Customer Success", "Initrode", ["champion", "warm"], false],
  ["c24", "Samuel Rivera", "Founder & CTO", "Spacely Sprockets", ["technical", "vip"], true],
  ["c25", "Zoe Campbell", "Revenue Operations", "Cogswell Cogs", ["warm"], false],
  ["c26", "Jack Morgan", "Director of Partnerships", "Oceanic Airlines", ["decision-maker"], false],
  ["c27", "Lily Evans", "Engineering Lead", "Hanso Foundation", ["technical"], false],
  ["c28", "Owen Hughes", "General Manager", "Weyland-Yutani", ["executive", "vip"], true],
  ["c29", "Nora Bailey", "Marketing Manager", "Monarch Solutions", ["influencer"], false],
  ["c30", "Leo Sanders", "Head of Finance", "Black Mesa", ["finance", "executive"], false],
];

const buildContact = (owner, [key, name, title, company, tags, favorite]) => ({
  owner,
  name,
  title,
  company,
  email: `${name.split(" ")[0].toLowerCase()}@${slug(company)}.com`,
  phone: `+1 555 0${100 + num(key)}`,
  tags,
  favorite,
  notes: favorite ? "Primary point of contact." : "",
  createdAt: daysAgo(num(key) * 7),
});

/* ───────────────────────────── Notes ───────────────────────────── */
// [content, leadKey, pinned, ageDays]
const NOTES = [
  ["Decision expected end of month. Loop in a solutions engineer for the technical review.", "l2", true, 3],
  ["Pricing pushback on the Pro tier — prepare an ROI one-pager before the next call.", "l3", false, 6],
  ["Champion is leaving the company; identify a backup stakeholder ASAP.", "l7", true, 9],
  ["Security questionnaire + SOC 2 report requested. Sent to the trust center.", "l12", false, 12],
  ["Great discovery call — strong interest in the analytics module.", "l1", false, 1],
  ["Expansion likely next quarter — multi-year deal already signed.", "l9", false, 18],
  ["Scheduling a technical deep-dive with the engineering team.", "l10", false, 5],
  ["Early stage, budget unconfirmed. Re-engage in two weeks.", "l5", false, 2],
  ["Wants a custom integration with their billing system. Scope with engineering before quoting.", "l17", true, 4],
  ["Legal flagged data-residency concerns — confirm EU hosting option.", "l23", false, 7],
  ["Strong referral from an existing customer. Warm intro already made.", "l20", false, 22],
  ["Evaluating two competitors. Differentiate on onboarding speed and support SLAs.", "l34", true, 8],
  ["Budget approved for Q4. Waiting on procurement to issue a PO.", "l18", false, 10],
  ["Lost to an incumbent on price. Revisit in six months.", "l22", false, 60],
  ["Demo went well — asked for a sandbox environment for their team.", "l30", false, 3],
  ["Renewal conversation should start 90 days before contract end.", "l26", false, 25],
  ["Champion promoted to VP — good opportunity to expand scope.", "l32", true, 14],
  ["Needs SSO and audit logs before they can sign off.", "l37", false, 6],
  ["Initial outreach got a reply. Meeting booked for next week.", "l27", false, 1],
  ["Contract signed. Kickoff call scheduled with the implementation team.", "l39", false, 20],
  ["Went quiet after the proposal. Try a different stakeholder.", "l38", false, 16],
  ["Interested in the analytics add-on. Send pricing for 50 seats.", "l21", false, 5],
  ["Security review passed. Moving to commercial negotiation.", "l29", true, 9],
  ["Small team, price sensitive. Offer the annual-prepay discount.", "l25", false, 11],
];

/* ───────────────────────────── Tasks ───────────────────────────── */
// [key, title, priority, status, dueDate, leadKey]
const TASKS = [
  ["t1", "Send proposal follow-up to Initech", "High", "Pending", daysAgo(2), "l3"],
  ["t2", "Schedule technical deep-dive with Wayne Ent.", "Medium", "In Progress", daysAhead(3), "l10"],
  ["t3", "Quarterly check-in with Massive Dynamic", "Low", "Pending", daysAhead(7), "l9"],
  ["t4", "Draft ROI one-pager for Initech", "High", "Completed", daysAgo(4), "l3"],
  ["t5", "Negotiate pricing with Cyberdyne", "High", "Pending", new Date(), "l12"],
  ["t6", "Share case study with Globex", "Medium", "Pending", daysAhead(1), "l2"],
  ["t7", "Confirm contract redlines with Pied Piper", "High", "In Progress", daysAgo(1), "l7"],
  ["t8", "Book discovery call with Oscorp", "Low", "Pending", daysAhead(5), "l15"],
  ["t9", "Send security docs to Cyberdyne", "Medium", "Completed", daysAgo(8), "l12"],
  ["t10", "Re-engage stalled deal at Soylent", "Low", "Pending", daysAhead(14), "l5"],
  ["t11", "Scope billing integration for Gringotts", "High", "In Progress", daysAhead(2), "l17"],
  ["t12", "Confirm EU data-residency options with legal", "High", "Pending", daysAhead(1), "l23"],
  ["t13", "Send pricing for 50 seats to Pendant Publishing", "Medium", "Pending", daysAhead(4), "l21"],
  ["t14", "Prepare competitive comparison for Weyland-Yutani", "High", "In Progress", daysAhead(2), "l34"],
  ["t15", "Follow up on PO with Nakatomi procurement", "Medium", "Pending", daysAgo(1), "l18"],
  ["t16", "Set up sandbox environment for Spacely Sprockets", "High", "Completed", daysAgo(2), "l30"],
  ["t17", "Kickoff call with Black Mesa implementation team", "High", "Completed", daysAgo(10), "l39"],
  ["t18", "Start renewal discussion with Prestige Worldwide", "Medium", "Pending", daysAhead(20), "l26"],
  ["t19", "Schedule expansion call with Oceanic Airlines", "Medium", "Pending", daysAhead(6), "l32"],
  ["t20", "Compile SSO and audit-log requirements for Plaid", "High", "In Progress", daysAhead(3), "l37"],
  ["t21", "Prepare discovery questions for Sterling Cooper", "Medium", "Pending", daysAhead(1), "l27"],
  ["t22", "Reach out to a new stakeholder at Tessier-Ashpool", "Low", "Pending", daysAhead(8), "l38"],
  ["t23", "Send annual-prepay offer to Bluth Company", "Low", "Pending", daysAhead(5), "l25"],
  ["t24", "Update CRM after Initrode security review", "Low", "Completed", daysAgo(5), "l29"],
  ["t25", "Draft proposal for Duff Beverages", "Medium", "Pending", daysAhead(9), "l19"],
  ["t26", "Review contract redlines with Wonka Industries", "High", "Completed", daysAgo(15), "l20"],
  ["t27", "Intro call with Dunder Mifflin", "Low", "Pending", daysAhead(2), "l24"],
  ["t28", "Send case study to Hanso Foundation", "Medium", "In Progress", daysAhead(4), "l33"],
  ["t29", "Log lost-deal reasons for Rekall", "Low", "Completed", daysAgo(30), "l22"],
  ["t30", "Book demo with Monarch Solutions", "Medium", "Pending", daysAhead(3), "l35"],
];

/* ───────────────────────────── Runner ──────────────────────────── */
const wipeOwnerData = async (ownerId) => {
  await Promise.all([
    Lead.deleteMany({ owner: ownerId }),
    Contact.deleteMany({ owner: ownerId }),
    Note.deleteMany({ owner: ownerId }),
    Task.deleteMany({ owner: ownerId }),
  ]);
};

const seed = async () => {
  await connectDB();

  const destroy = process.argv.includes("--destroy");

  let user = await User.findOne({ email: DEMO_EMAIL });

  if (destroy) {
    if (user) {
      await wipeOwnerData(user._id);
      await User.deleteOne({ _id: user._id });
    }
    console.log("Demo data removed");
    return;
  }

  if (user) {
    await wipeOwnerData(user._id);
  } else {
    // Password is hashed by the User model's pre-save hook
    user = await User.create({
      name: "Alex Carter",
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      role: "owner",
      company: "Time To Program",
    });
  }

  const owner = user._id;

  const leads = await Lead.insertMany(LEADS.map((l) => buildLead(owner, l)));
  const leadIdByKey = {};
  LEADS.forEach((l, i) => (leadIdByKey[l[0]] = leads[i]._id));

  await Contact.insertMany(CONTACTS.map((c) => buildContact(owner, c)));

  await Note.insertMany(
    NOTES.map(([content, leadKey, pinned, ageDays]) => ({
      owner,
      content,
      lead: leadIdByKey[leadKey],
      contact: null,
      pinned,
      createdAt: daysAgo(ageDays),
    })),
  );

  await Task.insertMany(
    TASKS.map(([key, title, priority, status, dueDate, leadKey]) => ({
      owner,
      title,
      description: "",
      dueDate,
      status,
      priority,
      relatedLead: leadIdByKey[leadKey],
      relatedContact: null,
      completedAt: status === "Completed" ? daysAgo(1) : null,
      createdAt: daysAgo(num(key) * 2),
    })),
  );

  console.log(
    `Seeded: ${LEADS.length} leads, ${CONTACTS.length} contacts, ${NOTES.length} notes, ${TASKS.length} tasks`,
  );
  console.log(`Login -> ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
};

seed()
  .catch((err) => {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());