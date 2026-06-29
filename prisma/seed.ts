/// <reference types="node" />
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB, disconnectDB } from "../src/config/database";
import { Company, Job, NewsletterSubscription, User } from "../src/models";
import { JobStatus, JobType, RemoteOption } from "../src/models/types";

async function upsertUser(email: string, data: any) {
  return User.findOneAndUpdate(
    { email },
    { $setOnInsert: data },
    { new: true, upsert: true }
  );
}

async function main() {
  await connectDB();
  console.log("Seeding MongoDB database...");

  const adminPasswordHash = await bcrypt.hash("Admin@1234", 12);
  const admin = await upsertUser("admin@hirehub.com", {
    email: "admin@hirehub.com",
    name: "HireHub Admin",
    passwordHash: adminPasswordHash,
    role: "ADMIN",
  });
  console.log("Admin user ready:", admin.email);

  const candidatePasswordHash = await bcrypt.hash("Candidate@1234", 12);
  const candidate = await upsertUser("jane@hirehub.com", {
    email: "jane@hirehub.com",
    name: "Jane Doe",
    passwordHash: candidatePasswordHash,
    role: "CANDIDATE",
    profile: {
      phone: "+91 98765 43210",
      skills: ["React", "TypeScript", "Node.js"],
      experienceLevel: "3-5 Years",
      currentSalary: "INR 12 - 18 LPA",
      preferredLocation: "Bangalore, India",
      jobType: "Full Time",
      isRemoteOnly: false,
    },
  });
  console.log("Candidate user ready:", candidate.email);

  const companySeeds = [
    ["Google", "G", "from-blue-500 to-red-500", "Technology", "100,000+", "google.com"],
    ["Netflix", "N", "from-red-600 to-black", "Entertainment", "10,000+", "netflix.com"],
    ["Spotify", "S", "from-green-500 to-green-700", "Music & Media", "10,000+", "spotify.com"],
    ["Microsoft", "M", "from-orange-500 to-blue-500", "Technology", "100,000+", "microsoft.com"],
    ["Amazon", "A", "from-yellow-500 to-orange-600", "E-Commerce & Cloud", "100,000+", "amazon.com"],
    ["OpenAI", "O", "from-slate-700 to-slate-900", "Artificial Intelligence", "1,000+", "openai.com"],
  ];

  const companies = await Promise.all(
    companySeeds.map(([name, initial, color, industry, size, website]) =>
      Company.findOneAndUpdate(
        { name },
        { $setOnInsert: { name, initial, color, industry, size, website } },
        { new: true, upsert: true }
      )
    )
  );
  console.log(`${companies.length} companies ready`);

  const companyMap = Object.fromEntries(companies.map((company: any) => [company.name, company]));
  const jobsData = [
    {
      title: "Senior Frontend Developer",
      company: "Google",
      location: "Bangalore, India",
      experience: "3-5 Years",
      salary: "INR 20 - 30 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "Jest"],
      category: "Frontend",
      featured: true,
      status: "ACTIVE" as JobStatus,
      description: "Join Google's Search team to build elegant, performant interfaces used by billions.",
      requirements: ["5+ years of React/TypeScript experience", "Deep understanding of modern web performance", "Strong design taste and CSS fundamentals", "Experience with SSR frameworks like Next.js"],
      responsibilities: ["Architect new product surfaces from idea to launch", "Collaborate with designers on motion and interaction", "Mentor engineers across the org", "Own observability and quality"],
      benefits: ["Equity", "Health, dental and vision", "Learning stipend", "Unlimited PTO"],
    },
    {
      title: "Backend Engineer",
      company: "Netflix",
      location: "Mumbai, India",
      experience: "4-6 Years",
      salary: "INR 25 - 35 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["Node.js", "Python", "AWS", "MongoDB", "Kafka", "Docker"],
      category: "Backend",
      status: "ACTIVE" as JobStatus,
      description: "Build streaming infrastructure with low latency at global scale.",
      requirements: ["Distributed systems experience", "Strong CS fundamentals", "Production AWS experience"],
      responsibilities: ["Design APIs at scale", "Own SLOs", "Improve playback reliability"],
      benefits: ["Top-of-market comp", "Stock", "Wellness budget"],
    },
    {
      title: "UI/UX Designer",
      company: "Spotify",
      location: "Bangalore, India",
      experience: "2-4 Years",
      salary: "INR 12 - 18 LPA",
      type: "FULL_TIME" as JobType,
      remote: "HYBRID" as RemoteOption,
      skills: ["Figma", "Adobe XD", "UI Design", "Prototyping", "Motion"],
      category: "Design",
      status: "ACTIVE" as JobStatus,
      description: "Shape the listening experience for Spotify users across platforms.",
      requirements: ["Strong portfolio", "Systems thinking", "Motion fluency"],
      responsibilities: ["Own design across surfaces", "Build with the design system team"],
      benefits: ["Music budget", "Remote-friendly", "Conference stipend"],
    },
    {
      title: "Cloud Solutions Architect",
      company: "Microsoft",
      location: "Gurgaon, India",
      experience: "6-8 Years",
      salary: "INR 30 - 45 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["Azure", "AWS", "Docker", "Kubernetes", "Terraform", "Go"],
      category: "DevOps",
      status: "ACTIVE" as JobStatus,
      description: "Help enterprise customers modernize their cloud architecture on Azure.",
      requirements: ["Azure expert", "Customer-facing experience", "Architecture certifications"],
      responsibilities: ["Architect enterprise migrations", "Run executive workshops"],
      benefits: ["Stock", "Bonus", "Sabbatical"],
    },
    {
      title: "DevOps Engineer",
      company: "Amazon",
      location: "Hyderabad, India",
      experience: "3-5 Years",
      salary: "INR 18 - 28 LPA",
      type: "FULL_TIME" as JobType,
      remote: "REMOTE" as RemoteOption,
      skills: ["DevOps", "Jenkins", "Terraform", "Kubernetes", "AWS"],
      category: "DevOps",
      status: "ACTIVE" as JobStatus,
      description: "Own platform reliability for a high-traffic AWS service.",
      requirements: ["CI/CD mastery", "Kubernetes in production", "On-call experience"],
      responsibilities: ["Build self-serve platforms", "Reduce operational toil"],
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
      description: "Train frontier models and improve evaluation infrastructure.",
      requirements: ["Publications a plus", "Strong systems skills", "PyTorch fluency"],
      responsibilities: ["Run training experiments", "Improve eval infra"],
      benefits: ["Top comp", "Compute budget", "Health"],
    },
  ];

  for (const jobData of jobsData) {
    const { company, ...rest } = jobData;
    await Job.findOneAndUpdate(
      { title: rest.title, companyId: companyMap[company].id },
      { $setOnInsert: { ...rest, companyId: companyMap[company].id, postedById: admin.id } },
      { new: true, upsert: true }
    );
  }
  console.log(`${jobsData.length} jobs ready`);

  await NewsletterSubscription.findOneAndUpdate(
    { email: "test@hirehub.com" },
    { $setOnInsert: { email: "test@hirehub.com" } },
    { new: true, upsert: true }
  );

  console.log("Seed complete");
  console.log("Admin: admin@hirehub.com / Admin@1234");
  console.log("Candidate: jane@hirehub.com / Candidate@1234");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
