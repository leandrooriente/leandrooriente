const url = new URL(process.env.SITE_URL || "https://leandrooriente.com").origin;

export default {
  url,
  name: "Leandro Oriente",
  language: "en",
  isPreview: url !== "https://leandrooriente.com",
  author: {
    name: "Leandro Oriente",
    jobTitle: "Staff frontend developer",
    sameAs: ["https://www.linkedin.com/in/leandrooriente/"]
  }
};
