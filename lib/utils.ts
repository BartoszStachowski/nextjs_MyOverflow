import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { techMap } from "@/constants/tech-map";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDeviconClassName = (techName: string) => {
  const normalizeTechName = techName.replace(/[.]/g, "").toLocaleLowerCase();

  return techMap[normalizeTechName]
    ? `${techMap[normalizeTechName]} colored`
    : "devicon-devicon-plain";
};

export const getTimeStamp = (createdAt: Date) => {
  const date = new Date(createdAt);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  const units = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const unit of units) {
    const interval = Math.floor(secondsAgo / unit.seconds);
    if (interval >= 1) {
      return `${interval} ${unit.label}${interval > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

export const techDescriptionMap: Record<string, string> = {
  javascript:
    "JavaScript is the core language of the web, used to create interactive interfaces, dynamic pages, and full-stack applications.",

  typescript:
    "TypeScript extends JavaScript with static typing, helping developers build safer, more predictable, and easier-to-maintain applications.",

  react:
    "React is a component-based library for creating reusable, responsive, and interactive user interfaces.",

  nextjs:
    "Next.js is a React framework that supports server rendering, routing, API endpoints, and performance optimization.",

  vue: "Vue is a progressive JavaScript framework designed for building approachable, flexible, and component-based user interfaces.",

  nuxt: "Nuxt is a Vue framework that provides routing, server rendering, API support, and tools for building production-ready applications.",

  angular:
    "Angular is a complete frontend framework for building structured, scalable, and feature-rich web applications.",

  nodejs:
    "Node.js allows JavaScript to run on the server, making it suitable for APIs, real-time applications, and backend services.",

  express:
    "Express is a lightweight Node.js framework commonly used to build web servers, REST APIs, and backend applications.",

  python:
    "Python is a readable and versatile programming language used in web development, automation, data analysis, and artificial intelligence.",

  java: "Java is a strongly typed, object-oriented language widely used for enterprise systems, backend services, and Android applications.",

  cplusplus:
    "C++ is a high-performance programming language often used for system software, game engines, embedded systems, and demanding applications.",

  php: "PHP is a server-side programming language widely used for building dynamic websites, web applications, and content management systems.",

  git: "Git is a distributed version control system used to track code changes, manage branches, and collaborate with other developers.",

  docker:
    "Docker packages applications and their dependencies into containers, making development and deployment environments more consistent.",

  mongodb:
    "MongoDB is a document-oriented NoSQL database designed for storing flexible, JSON-like data structures.",

  mysql:
    "MySQL is a widely used relational database known for its simplicity, reliability, and strong support in web applications.",

  postgresql:
    "PostgreSQL is an advanced open-source relational database offering strong SQL support, extensibility, and data integrity.",

  redis:
    "Redis is a fast in-memory data store commonly used for caching, sessions, queues, and real-time application features.",

  aws: "AWS is a cloud platform providing services for hosting, databases, storage, networking, monitoring, and application deployment.",
};

const techAliases: Record<string, string> = {
  vue3: "vue",
  vuejs: "vue",

  next: "nextjs",
  nextjs: "nextjs",

  node: "nodejs",
  nodejs: "nodejs",
};

export const getTechDescription = (techName: string) => {
  const normalizedTechName = techName.replace(/[ .-]/g, "").toLowerCase();

  const techKey = techAliases[normalizedTechName] ?? normalizedTechName;

  return (
    techDescriptionMap[techKey] ??
    `${techName} is a technology or tool widely used in web development, providing valuable features and capabilities.`
  );
};

export const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toString();
  }
};
