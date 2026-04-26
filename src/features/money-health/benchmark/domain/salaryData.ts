/**
 * Salary benchmark data based on Michael Page Malaysia Salary Guide 2025/2026.
 * All figures are ANNUAL salaries in MYR.
 * Source: Michael Page Malaysia (michaelpage.com.my/salary-guide)
 */

export interface SalaryBenchmark {
  role: string;
  sector: string;
  specialisation: string;
  minAnnual: number;
  avgAnnual: number;
  maxAnnual: number;
}

export interface Sector {
  name: string;
  specialisations: string[];
}

export const SECTORS: Sector[] = [
  {
    name: "Technology",
    specialisations: [
      "Software Development",
      "Data & Analytics",
      "Cloud & Infrastructure",
      "Cybersecurity",
      "Product & Project Management",
      "IT Management",
    ],
  },
  {
    name: "Finance & Accounting",
    specialisations: [
      "Financial Planning & Analysis",
      "Audit & Risk",
      "Treasury & Corporate Finance",
      "Tax",
      "General Accounting",
    ],
  },
  {
    name: "Banking & Financial Services",
    specialisations: [
      "Retail Banking",
      "Investment Banking",
      "Wealth Management",
      "Compliance & Risk",
    ],
  },
  {
    name: "Marketing & Digital",
    specialisations: [
      "Brand & Communications",
      "Digital Marketing",
      "E-Commerce",
      "Market Research",
    ],
  },
  {
    name: "Engineering & Manufacturing",
    specialisations: [
      "Mechanical Engineering",
      "Electrical & Electronics",
      "Chemical & Process",
      "Quality & HSE",
      "Supply Chain & Logistics",
    ],
  },
  {
    name: "Human Resources",
    specialisations: [
      "HR Business Partnering",
      "Talent Acquisition",
      "Compensation & Benefits",
      "Learning & Development",
      "HR Operations",
    ],
  },
  {
    name: "Sales",
    specialisations: [
      "Enterprise Sales",
      "Tech Sales",
      "FMCG Sales",
      "Business Development",
    ],
  },
  {
    name: "Legal & Compliance",
    specialisations: [
      "Corporate & Commercial",
      "Regulatory & Compliance",
      "Intellectual Property",
    ],
  },
];

export const SALARY_DATA: SalaryBenchmark[] = [
  // ── Technology ──────────────────────────────────────────────
  // Software Development
  { role: "Junior Software Developer", sector: "Technology", specialisation: "Software Development", minAnnual: 42000, avgAnnual: 54000, maxAnnual: 72000 },
  { role: "Software Developer", sector: "Technology", specialisation: "Software Development", minAnnual: 72000, avgAnnual: 96000, maxAnnual: 132000 },
  { role: "Senior Software Developer", sector: "Technology", specialisation: "Software Development", minAnnual: 120000, avgAnnual: 156000, maxAnnual: 216000 },
  { role: "Lead Developer / Architect", sector: "Technology", specialisation: "Software Development", minAnnual: 168000, avgAnnual: 228000, maxAnnual: 312000 },
  { role: "Frontend Developer", sector: "Technology", specialisation: "Software Development", minAnnual: 60000, avgAnnual: 84000, maxAnnual: 120000 },
  { role: "Backend Developer", sector: "Technology", specialisation: "Software Development", minAnnual: 72000, avgAnnual: 102000, maxAnnual: 144000 },
  { role: "Full Stack Developer", sector: "Technology", specialisation: "Software Development", minAnnual: 78000, avgAnnual: 108000, maxAnnual: 156000 },
  { role: "Mobile Developer", sector: "Technology", specialisation: "Software Development", minAnnual: 72000, avgAnnual: 96000, maxAnnual: 144000 },
  { role: "DevOps Engineer", sector: "Technology", specialisation: "Software Development", minAnnual: 84000, avgAnnual: 120000, maxAnnual: 180000 },
  { role: "QA / Test Engineer", sector: "Technology", specialisation: "Software Development", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },

  // Data & Analytics
  { role: "Data Analyst", sector: "Technology", specialisation: "Data & Analytics", minAnnual: 54000, avgAnnual: 84000, maxAnnual: 120000 },
  { role: "Senior Data Analyst", sector: "Technology", specialisation: "Data & Analytics", minAnnual: 96000, avgAnnual: 132000, maxAnnual: 168000 },
  { role: "Data Engineer", sector: "Technology", specialisation: "Data & Analytics", minAnnual: 84000, avgAnnual: 120000, maxAnnual: 180000 },
  { role: "Data Scientist", sector: "Technology", specialisation: "Data & Analytics", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 216000 },
  { role: "Machine Learning Engineer", sector: "Technology", specialisation: "Data & Analytics", minAnnual: 108000, avgAnnual: 168000, maxAnnual: 252000 },
  { role: "BI Analyst / Developer", sector: "Technology", specialisation: "Data & Analytics", minAnnual: 60000, avgAnnual: 90000, maxAnnual: 132000 },
  { role: "Head of Data", sector: "Technology", specialisation: "Data & Analytics", minAnnual: 204000, avgAnnual: 300000, maxAnnual: 420000 },

  // Cloud & Infrastructure
  { role: "System Administrator", sector: "Technology", specialisation: "Cloud & Infrastructure", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Cloud Engineer", sector: "Technology", specialisation: "Cloud & Infrastructure", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "Cloud Architect", sector: "Technology", specialisation: "Cloud & Infrastructure", minAnnual: 180000, avgAnnual: 264000, maxAnnual: 360000 },
  { role: "Network Engineer", sector: "Technology", specialisation: "Cloud & Infrastructure", minAnnual: 60000, avgAnnual: 90000, maxAnnual: 132000 },
  { role: "Infrastructure Manager", sector: "Technology", specialisation: "Cloud & Infrastructure", minAnnual: 144000, avgAnnual: 204000, maxAnnual: 276000 },

  // Cybersecurity
  { role: "Security Analyst", sector: "Technology", specialisation: "Cybersecurity", minAnnual: 72000, avgAnnual: 108000, maxAnnual: 156000 },
  { role: "Security Engineer", sector: "Technology", specialisation: "Cybersecurity", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "Security Architect", sector: "Technology", specialisation: "Cybersecurity", minAnnual: 180000, avgAnnual: 264000, maxAnnual: 372000 },
  { role: "CISO", sector: "Technology", specialisation: "Cybersecurity", minAnnual: 300000, avgAnnual: 480000, maxAnnual: 720000 },

  // Product & Project Management
  { role: "Project Manager", sector: "Technology", specialisation: "Product & Project Management", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "Senior Project Manager", sector: "Technology", specialisation: "Product & Project Management", minAnnual: 144000, avgAnnual: 204000, maxAnnual: 276000 },
  { role: "Product Manager", sector: "Technology", specialisation: "Product & Project Management", minAnnual: 108000, avgAnnual: 168000, maxAnnual: 252000 },
  { role: "Senior Product Manager", sector: "Technology", specialisation: "Product & Project Management", minAnnual: 168000, avgAnnual: 240000, maxAnnual: 336000 },
  { role: "Scrum Master", sector: "Technology", specialisation: "Product & Project Management", minAnnual: 84000, avgAnnual: 120000, maxAnnual: 168000 },
  { role: "Business Analyst", sector: "Technology", specialisation: "Product & Project Management", minAnnual: 72000, avgAnnual: 108000, maxAnnual: 156000 },

  // IT Management
  { role: "IT Manager", sector: "Technology", specialisation: "IT Management", minAnnual: 144000, avgAnnual: 216000, maxAnnual: 300000 },
  { role: "IT Director", sector: "Technology", specialisation: "IT Management", minAnnual: 264000, avgAnnual: 396000, maxAnnual: 540000 },
  { role: "CTO", sector: "Technology", specialisation: "IT Management", minAnnual: 360000, avgAnnual: 540000, maxAnnual: 720000 },
  { role: "CIO", sector: "Technology", specialisation: "IT Management", minAnnual: 360000, avgAnnual: 540000, maxAnnual: 720000 },
  { role: "VP of Engineering", sector: "Technology", specialisation: "IT Management", minAnnual: 300000, avgAnnual: 432000, maxAnnual: 600000 },

  // ── Finance & Accounting ───────────────────────────────────
  { role: "Accounts Executive", sector: "Finance & Accounting", specialisation: "General Accounting", minAnnual: 36000, avgAnnual: 48000, maxAnnual: 66000 },
  { role: "Accountant", sector: "Finance & Accounting", specialisation: "General Accounting", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 96000 },
  { role: "Senior Accountant", sector: "Finance & Accounting", specialisation: "General Accounting", minAnnual: 72000, avgAnnual: 96000, maxAnnual: 132000 },
  { role: "Finance Manager", sector: "Finance & Accounting", specialisation: "General Accounting", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 228000 },
  { role: "Financial Controller", sector: "Finance & Accounting", specialisation: "General Accounting", minAnnual: 180000, avgAnnual: 264000, maxAnnual: 360000 },
  { role: "CFO", sector: "Finance & Accounting", specialisation: "General Accounting", minAnnual: 360000, avgAnnual: 540000, maxAnnual: 780000 },

  { role: "FP&A Analyst", sector: "Finance & Accounting", specialisation: "Financial Planning & Analysis", minAnnual: 60000, avgAnnual: 84000, maxAnnual: 120000 },
  { role: "Senior FP&A Analyst", sector: "Finance & Accounting", specialisation: "Financial Planning & Analysis", minAnnual: 96000, avgAnnual: 132000, maxAnnual: 180000 },
  { role: "FP&A Manager", sector: "Finance & Accounting", specialisation: "Financial Planning & Analysis", minAnnual: 144000, avgAnnual: 204000, maxAnnual: 276000 },

  { role: "Internal Auditor", sector: "Finance & Accounting", specialisation: "Audit & Risk", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Audit Manager", sector: "Finance & Accounting", specialisation: "Audit & Risk", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 228000 },
  { role: "Risk Manager", sector: "Finance & Accounting", specialisation: "Audit & Risk", minAnnual: 132000, avgAnnual: 192000, maxAnnual: 264000 },

  { role: "Treasury Analyst", sector: "Finance & Accounting", specialisation: "Treasury & Corporate Finance", minAnnual: 60000, avgAnnual: 84000, maxAnnual: 120000 },
  { role: "Treasury Manager", sector: "Finance & Accounting", specialisation: "Treasury & Corporate Finance", minAnnual: 144000, avgAnnual: 204000, maxAnnual: 288000 },
  { role: "Corporate Finance Manager", sector: "Finance & Accounting", specialisation: "Treasury & Corporate Finance", minAnnual: 156000, avgAnnual: 228000, maxAnnual: 312000 },

  { role: "Tax Analyst", sector: "Finance & Accounting", specialisation: "Tax", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Tax Manager", sector: "Finance & Accounting", specialisation: "Tax", minAnnual: 132000, avgAnnual: 192000, maxAnnual: 264000 },
  { role: "Head of Tax", sector: "Finance & Accounting", specialisation: "Tax", minAnnual: 228000, avgAnnual: 324000, maxAnnual: 456000 },

  // ── Banking & Financial Services ──────────────────────────
  { role: "Retail Banking Officer", sector: "Banking & Financial Services", specialisation: "Retail Banking", minAnnual: 42000, avgAnnual: 60000, maxAnnual: 84000 },
  { role: "Branch Manager", sector: "Banking & Financial Services", specialisation: "Retail Banking", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "Relationship Manager", sector: "Banking & Financial Services", specialisation: "Retail Banking", minAnnual: 72000, avgAnnual: 108000, maxAnnual: 168000 },

  { role: "Investment Analyst", sector: "Banking & Financial Services", specialisation: "Investment Banking", minAnnual: 72000, avgAnnual: 120000, maxAnnual: 192000 },
  { role: "Investment Banking Associate", sector: "Banking & Financial Services", specialisation: "Investment Banking", minAnnual: 120000, avgAnnual: 192000, maxAnnual: 300000 },
  { role: "Investment Banking VP", sector: "Banking & Financial Services", specialisation: "Investment Banking", minAnnual: 264000, avgAnnual: 396000, maxAnnual: 600000 },

  { role: "Wealth Planner", sector: "Banking & Financial Services", specialisation: "Wealth Management", minAnnual: 72000, avgAnnual: 120000, maxAnnual: 192000 },
  { role: "Private Banker", sector: "Banking & Financial Services", specialisation: "Wealth Management", minAnnual: 144000, avgAnnual: 240000, maxAnnual: 420000 },

  { role: "Compliance Analyst", sector: "Banking & Financial Services", specialisation: "Compliance & Risk", minAnnual: 60000, avgAnnual: 84000, maxAnnual: 120000 },
  { role: "Compliance Manager", sector: "Banking & Financial Services", specialisation: "Compliance & Risk", minAnnual: 132000, avgAnnual: 192000, maxAnnual: 276000 },
  { role: "Head of Compliance", sector: "Banking & Financial Services", specialisation: "Compliance & Risk", minAnnual: 264000, avgAnnual: 384000, maxAnnual: 540000 },

  // ── Marketing & Digital ────────────────────────────────────
  { role: "Marketing Executive", sector: "Marketing & Digital", specialisation: "Brand & Communications", minAnnual: 36000, avgAnnual: 54000, maxAnnual: 72000 },
  { role: "Marketing Manager", sector: "Marketing & Digital", specialisation: "Brand & Communications", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "Brand Manager", sector: "Marketing & Digital", specialisation: "Brand & Communications", minAnnual: 108000, avgAnnual: 156000, maxAnnual: 216000 },
  { role: "Communications Manager", sector: "Marketing & Digital", specialisation: "Brand & Communications", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "Head of Marketing", sector: "Marketing & Digital", specialisation: "Brand & Communications", minAnnual: 204000, avgAnnual: 300000, maxAnnual: 420000 },
  { role: "CMO", sector: "Marketing & Digital", specialisation: "Brand & Communications", minAnnual: 360000, avgAnnual: 504000, maxAnnual: 720000 },

  { role: "Digital Marketing Executive", sector: "Marketing & Digital", specialisation: "Digital Marketing", minAnnual: 36000, avgAnnual: 54000, maxAnnual: 78000 },
  { role: "Digital Marketing Manager", sector: "Marketing & Digital", specialisation: "Digital Marketing", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "SEO / SEM Specialist", sector: "Marketing & Digital", specialisation: "Digital Marketing", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Social Media Manager", sector: "Marketing & Digital", specialisation: "Digital Marketing", minAnnual: 48000, avgAnnual: 78000, maxAnnual: 120000 },
  { role: "Content Strategist", sector: "Marketing & Digital", specialisation: "Digital Marketing", minAnnual: 60000, avgAnnual: 90000, maxAnnual: 132000 },

  { role: "E-Commerce Executive", sector: "Marketing & Digital", specialisation: "E-Commerce", minAnnual: 42000, avgAnnual: 60000, maxAnnual: 84000 },
  { role: "E-Commerce Manager", sector: "Marketing & Digital", specialisation: "E-Commerce", minAnnual: 108000, avgAnnual: 156000, maxAnnual: 228000 },
  { role: "Head of E-Commerce", sector: "Marketing & Digital", specialisation: "E-Commerce", minAnnual: 204000, avgAnnual: 300000, maxAnnual: 420000 },

  { role: "Market Research Analyst", sector: "Marketing & Digital", specialisation: "Market Research", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Market Research Manager", sector: "Marketing & Digital", specialisation: "Market Research", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 228000 },

  // ── Engineering & Manufacturing ────────────────────────────
  { role: "Mechanical Engineer", sector: "Engineering & Manufacturing", specialisation: "Mechanical Engineering", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Senior Mechanical Engineer", sector: "Engineering & Manufacturing", specialisation: "Mechanical Engineering", minAnnual: 84000, avgAnnual: 120000, maxAnnual: 168000 },
  { role: "Engineering Manager", sector: "Engineering & Manufacturing", specialisation: "Mechanical Engineering", minAnnual: 144000, avgAnnual: 204000, maxAnnual: 288000 },

  { role: "Electrical Engineer", sector: "Engineering & Manufacturing", specialisation: "Electrical & Electronics", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Electronics Engineer", sector: "Engineering & Manufacturing", specialisation: "Electrical & Electronics", minAnnual: 54000, avgAnnual: 78000, maxAnnual: 120000 },
  { role: "Senior Electrical Engineer", sector: "Engineering & Manufacturing", specialisation: "Electrical & Electronics", minAnnual: 96000, avgAnnual: 132000, maxAnnual: 180000 },

  { role: "Process Engineer", sector: "Engineering & Manufacturing", specialisation: "Chemical & Process", minAnnual: 54000, avgAnnual: 78000, maxAnnual: 120000 },
  { role: "Chemical Engineer", sector: "Engineering & Manufacturing", specialisation: "Chemical & Process", minAnnual: 54000, avgAnnual: 84000, maxAnnual: 132000 },
  { role: "Plant Manager", sector: "Engineering & Manufacturing", specialisation: "Chemical & Process", minAnnual: 180000, avgAnnual: 264000, maxAnnual: 372000 },

  { role: "QA / QC Engineer", sector: "Engineering & Manufacturing", specialisation: "Quality & HSE", minAnnual: 42000, avgAnnual: 66000, maxAnnual: 96000 },
  { role: "Quality Manager", sector: "Engineering & Manufacturing", specialisation: "Quality & HSE", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 228000 },
  { role: "HSE Manager", sector: "Engineering & Manufacturing", specialisation: "Quality & HSE", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 240000 },

  { role: "Logistics Executive", sector: "Engineering & Manufacturing", specialisation: "Supply Chain & Logistics", minAnnual: 36000, avgAnnual: 54000, maxAnnual: 78000 },
  { role: "Supply Chain Manager", sector: "Engineering & Manufacturing", specialisation: "Supply Chain & Logistics", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 240000 },
  { role: "Head of Supply Chain", sector: "Engineering & Manufacturing", specialisation: "Supply Chain & Logistics", minAnnual: 228000, avgAnnual: 324000, maxAnnual: 456000 },

  // ── Human Resources ────────────────────────────────────────
  { role: "HR Executive", sector: "Human Resources", specialisation: "HR Operations", minAnnual: 36000, avgAnnual: 48000, maxAnnual: 66000 },
  { role: "HR Manager", sector: "Human Resources", specialisation: "HR Operations", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "HR Director", sector: "Human Resources", specialisation: "HR Operations", minAnnual: 228000, avgAnnual: 336000, maxAnnual: 480000 },

  { role: "HR Business Partner", sector: "Human Resources", specialisation: "HR Business Partnering", minAnnual: 96000, avgAnnual: 144000, maxAnnual: 204000 },
  { role: "Senior HRBP", sector: "Human Resources", specialisation: "HR Business Partnering", minAnnual: 144000, avgAnnual: 204000, maxAnnual: 276000 },
  { role: "Head of HRBP", sector: "Human Resources", specialisation: "HR Business Partnering", minAnnual: 228000, avgAnnual: 324000, maxAnnual: 456000 },

  { role: "Recruiter", sector: "Human Resources", specialisation: "Talent Acquisition", minAnnual: 42000, avgAnnual: 60000, maxAnnual: 84000 },
  { role: "Senior Recruiter", sector: "Human Resources", specialisation: "Talent Acquisition", minAnnual: 72000, avgAnnual: 96000, maxAnnual: 132000 },
  { role: "TA Manager", sector: "Human Resources", specialisation: "Talent Acquisition", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 240000 },
  { role: "Head of TA", sector: "Human Resources", specialisation: "Talent Acquisition", minAnnual: 204000, avgAnnual: 288000, maxAnnual: 396000 },

  { role: "C&B Analyst", sector: "Human Resources", specialisation: "Compensation & Benefits", minAnnual: 54000, avgAnnual: 78000, maxAnnual: 108000 },
  { role: "C&B Manager", sector: "Human Resources", specialisation: "Compensation & Benefits", minAnnual: 132000, avgAnnual: 192000, maxAnnual: 264000 },
  { role: "Head of C&B", sector: "Human Resources", specialisation: "Compensation & Benefits", minAnnual: 228000, avgAnnual: 324000, maxAnnual: 456000 },

  { role: "L&D Executive", sector: "Human Resources", specialisation: "Learning & Development", minAnnual: 42000, avgAnnual: 60000, maxAnnual: 84000 },
  { role: "L&D Manager", sector: "Human Resources", specialisation: "Learning & Development", minAnnual: 108000, avgAnnual: 156000, maxAnnual: 216000 },

  // ── Sales ──────────────────────────────────────────────────
  { role: "Account Executive", sector: "Sales", specialisation: "Enterprise Sales", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 108000 },
  { role: "Account Manager", sector: "Sales", specialisation: "Enterprise Sales", minAnnual: 72000, avgAnnual: 108000, maxAnnual: 156000 },
  { role: "Senior Account Manager", sector: "Sales", specialisation: "Enterprise Sales", minAnnual: 120000, avgAnnual: 168000, maxAnnual: 240000 },
  { role: "Sales Director", sector: "Sales", specialisation: "Enterprise Sales", minAnnual: 228000, avgAnnual: 336000, maxAnnual: 480000 },

  { role: "Tech Sales Executive", sector: "Sales", specialisation: "Tech Sales", minAnnual: 60000, avgAnnual: 90000, maxAnnual: 132000 },
  { role: "Tech Sales Manager", sector: "Sales", specialisation: "Tech Sales", minAnnual: 132000, avgAnnual: 192000, maxAnnual: 276000 },
  { role: "Head of Tech Sales", sector: "Sales", specialisation: "Tech Sales", minAnnual: 240000, avgAnnual: 348000, maxAnnual: 504000 },

  { role: "Sales Executive (FMCG)", sector: "Sales", specialisation: "FMCG Sales", minAnnual: 36000, avgAnnual: 54000, maxAnnual: 78000 },
  { role: "Area Sales Manager", sector: "Sales", specialisation: "FMCG Sales", minAnnual: 84000, avgAnnual: 120000, maxAnnual: 168000 },
  { role: "National Sales Manager", sector: "Sales", specialisation: "FMCG Sales", minAnnual: 180000, avgAnnual: 264000, maxAnnual: 372000 },

  { role: "BD Executive", sector: "Sales", specialisation: "Business Development", minAnnual: 42000, avgAnnual: 66000, maxAnnual: 96000 },
  { role: "BD Manager", sector: "Sales", specialisation: "Business Development", minAnnual: 108000, avgAnnual: 156000, maxAnnual: 228000 },
  { role: "Head of BD", sector: "Sales", specialisation: "Business Development", minAnnual: 204000, avgAnnual: 300000, maxAnnual: 420000 },

  // ── Legal & Compliance ─────────────────────────────────────
  { role: "Legal Executive", sector: "Legal & Compliance", specialisation: "Corporate & Commercial", minAnnual: 48000, avgAnnual: 72000, maxAnnual: 96000 },
  { role: "Legal Counsel", sector: "Legal & Compliance", specialisation: "Corporate & Commercial", minAnnual: 108000, avgAnnual: 168000, maxAnnual: 240000 },
  { role: "Senior Legal Counsel", sector: "Legal & Compliance", specialisation: "Corporate & Commercial", minAnnual: 180000, avgAnnual: 264000, maxAnnual: 372000 },
  { role: "Head of Legal", sector: "Legal & Compliance", specialisation: "Corporate & Commercial", minAnnual: 300000, avgAnnual: 432000, maxAnnual: 600000 },
  { role: "General Counsel", sector: "Legal & Compliance", specialisation: "Corporate & Commercial", minAnnual: 420000, avgAnnual: 600000, maxAnnual: 840000 },

  { role: "Compliance Officer", sector: "Legal & Compliance", specialisation: "Regulatory & Compliance", minAnnual: 60000, avgAnnual: 90000, maxAnnual: 132000 },
  { role: "Compliance Manager", sector: "Legal & Compliance", specialisation: "Regulatory & Compliance", minAnnual: 132000, avgAnnual: 192000, maxAnnual: 276000 },
  { role: "Head of Compliance", sector: "Legal & Compliance", specialisation: "Regulatory & Compliance", minAnnual: 264000, avgAnnual: 384000, maxAnnual: 540000 },

  { role: "IP Executive", sector: "Legal & Compliance", specialisation: "Intellectual Property", minAnnual: 54000, avgAnnual: 78000, maxAnnual: 108000 },
  { role: "IP Manager", sector: "Legal & Compliance", specialisation: "Intellectual Property", minAnnual: 132000, avgAnnual: 192000, maxAnnual: 264000 },
];

/**
 * Get all unique roles for a given sector + specialisation combo.
 */
export function getRolesForSpecialisation(sector: string, specialisation: string): SalaryBenchmark[] {
  return SALARY_DATA.filter(
    (d) => d.sector === sector && d.specialisation === specialisation
  );
}

/**
 * Search roles across all sectors by partial name match.
 */
export function searchRoles(query: string): SalaryBenchmark[] {
  if (!query || query.length < 2) return [];
  const lowerQ = query.toLowerCase();
  return SALARY_DATA.filter((d) => d.role.toLowerCase().includes(lowerQ));
}
