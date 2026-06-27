// ============================================================
// prisma/seed.ts
// Seed script — populates DB with companies, an admin user,
// and 6 job listings matching the frontend mock data
// ============================================================

import { PrismaClient, JobType, RemoteOption, JobStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database...");

  // ── 1. Create Admin User ──────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin@1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hirehub.com" },
    update: {},
    create: {
      email: "admin@hirehub.com",
      name: "HireHub Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });
  console.log("✅  Admin user created:", admin.email);

  // ── 2. Create Demo Candidate ──────────────────────────────
  const candidatePasswordHash = await bcrypt.hash("Candidate@1234", 12);
  const candidate = await prisma.user.upsert({
    where: { email: "jane@hirehub.com" },
    update: {},
    create: {
      email: "jane@hirehub.com",
      name: "Jane Doe",
      passwordHash: candidatePasswordHash,
      role: "CANDIDATE",
      profile: {
        create: {
          phone: "+91 98765 43210",
          skills: ["React", "TypeScript", "Node.js"],
          experienceLevel: "3-5 Years",
          currentSalary: "₹12 - 18 LPA",
          preferredLocation: "Bangalore, India",
          jobType: "Full Time",
          isRemoteOnly: false,
        },
      },
    },
  });
  console.log("✅  Candidate user created:", candidate.email);

  // ── 3. Create Companies ───────────────────────────────────
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { name: "Google" },
      update: {},
      create: {
        name: "Google",
        initial: "G",
        color: "from-blue-500 to-red-500",
        industry: "Technology",
        size: "100,000+",
        website: "google.com",
      },
    }),
    prisma.company.upsert({
      where: { name: "Netflix" },
      update: {},
      create: {
        name: "Netflix",
        initial: "N",
        color: "from-red-600 to-black",
        industry: "Entertainment",
        size: "10,000+",
        website: "netflix.com",
      },
    }),
    prisma.company.upsert({
      where: { name: "Spotify" },
      update: {},
      create: {
        name: "Spotify",
        initial: "S",
        color: "from-green-500 to-green-700",
        industry: "Music & Media",
        size: "10,000+",
        website: "spotify.com",
      },
    }),
    prisma.company.upsert({
      where: { name: "Microsoft" },
      update: {},
      create: {
        name: "Microsoft",
        initial: "M",
        color: "from-orange-500 to-blue-500",
        industry: "Technology",
        size: "100,000+",
        website: "microsoft.com",
      },
    }),
    prisma.company.upsert({
      where: { name: "Amazon" },
      update: {},
      create: {
        name: "Amazon",
        initial: "A",
        color: "from-yellow-500 to-orange-600",
        industry: "E-Commerce & Cloud",
        size: "100,000+",
        website: "amazon.com",
      },
    }),
    prisma.company.upsert({
      where: { name: "OpenAI" },
      update: {},
      create: {
        name: "OpenAI",
        initial: "O",
        color: "from-slate-700 to-slate-900",
        industry: "Artificial Intelligence",
        size: "1,000+",
        website: "openai.com",
      },
    }),
  ]);
  console.log(`✅  ${companies.length} companies seeded`);

  // Map for easy lookup
  const companyMap = Object.fromEntries(companies.map((c) => [c.name, c]));

  // ── 4. Create Jobs ────────────────────────────────────────
  const jobsData = [
    {
      title: "Senior Frontend Developer",
      company: "Google",
      location: "Bangalore, India",
      experience: "3-5 Years",
      salary: "₹20 - 30 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Jest"],
      category: "Frontend",
      featured: true,
      status: "ACTIVE" as JobStatus,
      description:
        "Join Google's Search team to build elegant, performant interfaces used by billions. We're looking for an engineer obsessed with craft, performance and clean APIs.",
      requirements: [
        "5+ years of React/TypeScript experience",
        "Deep understanding of modern web performance",
        "Strong design taste and CSS fundamentals",
        "Experience with SSR frameworks like Next.js",
      ],
      responsibilities: [
        "Architect new product surfaces from idea to launch",
        "Collaborate with designers on motion and interaction",
        "Mentor engineers across the org",
        "Own observability and quality for your slice",
      ],
      benefits: ["Equity", "Health, dental & vision", "Learning stipend", "Unlimited PTO"],
    },
    {
      title: "Backend Engineer",
      company: "Netflix",
      location: "Mumbai, India",
      experience: "4-6 Years",
      salary: "₹25 - 35 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["Node.js", "Python", "AWS", "PostgreSQL", "Kafka", "Docker"],
      category: "Backend",
      featured: false,
      status: "ACTIVE" as JobStatus,
      description:
        "Build the streaming infrastructure that delivers content to 270M+ members worldwide with sub-second latency.",
      requirements: [
        "Distributed systems experience",
        "Strong CS fundamentals",
        "Production AWS experience",
      ],
      responsibilities: [
        "Design APIs at scale",
        "Own SLOs",
        "Improve playback reliability",
      ],
      benefits: ["Top-of-market comp", "Stock", "Wellness budget"],
    },
    {
      title: "UI/UX Designer",
      company: "Spotify",
      location: "Bangalore, India",
      experience: "2-4 Years",
      salary: "₹12 - 18 LPA",
      type: "FULL_TIME" as JobType,
      remote: "HYBRID" as RemoteOption,
      skills: ["Figma", "Adobe XD", "UI Design", "Prototyping", "Motion"],
      category: "Design",
      featured: false,
      status: "ACTIVE" as JobStatus,
      description: "Shape the listening experience for 600M+ Spotify users across platforms.",
      requirements: ["Strong portfolio", "Systems thinking", "Motion fluency"],
      responsibilities: ["Own design across surfaces", "Build with the DS team"],
      benefits: ["Music budget", "Remote-friendly", "Conference stipend"],
    },
    {
      title: "Cloud Solutions Architect",
      company: "Microsoft",
      location: "Gurgaon, India",
      experience: "6-8 Years",
      salary: "₹30 - 45 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["Azure", "AWS", "Docker", "Kubernetes", "Terraform", "Go"],
      category: "DevOps",
      featured: false,
      status: "ACTIVE" as JobStatus,
      description: "Help enterprise customers modernize their cloud architecture on Azure.",
      requirements: [
        "Azure expert",
        "Customer-facing experience",
        "Architecture certifications",
      ],
      responsibilities: ["Architect enterprise migrations", "Run executive workshops"],
      benefits: ["Stock", "Bonus", "Sabbatical"],
    },
    {
      title: "DevOps Engineer",
      company: "Amazon",
      location: "Hyderabad, India",
      experience: "3-5 Years",
      salary: "₹18 - 28 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["DevOps", "Jenkins", "Terraform", "Kubernetes", "AWS"],
      category: "DevOps",
      featured: false,
      status: "ACTIVE" as JobStatus,
      description: "Own platform reliability for one of AWS's most-loved services.",
      requirements: ["CI/CD mastery", "K8s in prod", "On-call experience"],
      responsibilities: ["Build self-serve platforms", "Reduce toil"],
      benefits: ["RSUs", "Sign-on bonus", "Relocation"],
    },
    {
      title: "ML Research Engineer",
      company: "OpenAI",
      location: "San Francisco, USA",
      experience: "3-6 Years",
      salary: "$180 - 260k",
      type: "FULL_TIME" as JobType,
      remote: "HYBRID" as RemoteOption,
      skills: ["Python", "PyTorch", "CUDA", "Distributed Training"],
      category: "AI & ML",
      featured: true,
      status: "ACTIVE" as JobStatus,
      description: "Train frontier models that push the boundary of what's possible.",
      requirements: ["Publications a plus", "Strong systems skills", "PyTorch fluency"],
      responsibilities: ["Run training experiments", "Improve eval infra"],
      benefits: ["Top comp", "Compute budget", "Health"],
    },
  ];

  let jobCount = 0;
  for (const jobData of jobsData) {
    const { company: companyName, ...rest } = jobData;
    await prisma.job.create({
      data: {
        ...rest,
        companyId: companyMap[companyName].id,
        postedById: admin.id,
      },
    });
    jobCount++;
  }
  console.log(`✅  ${jobCount} jobs seeded`);

  // ── 5. Newsletter subscriptions ───────────────────────────
  await prisma.newsletterSubscription.upsert({
    where: { email: "test@hirehub.com" },
    update: {},
    create: { email: "test@hirehub.com" },
  });
  console.log("✅  Newsletter seed done");

  console.log("\n🎉  Database seeding completed!");
  console.log("─────────────────────────────────────────");
  console.log("   Admin     → admin@hirehub.com  / Admin@1234");
  console.log("   Candidate → jane@hirehub.com   / Candidate@1234");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
