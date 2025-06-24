import mongoose, { Document, Schema } from "mongoose";

export interface ILandingConfig {
  slug: string;
  logoUrl: string;
  primaryColor: string;
  hero: {
    backgroundImage: string;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
  };
  features: Array<{
    iconUrl: string;
    title: string;
    description: string;
  }>;
  portfolio: Array<{
    imageUrl: string;
    title: string;
    category: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
  testimonials: Array<{
    quote: string;
    name: string;
    role: string;
    avatarUrl: string;
    flagUrl: string;
  }>;
  clientLogos: string[];
  aboutText: string;
  mission: string;
  vision: string;
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  contactInfo: {
    address: string;
    phone: string;
    email: string;
  };
  footer: {
    copyrightText: string;
    privacyLink: string;
    termsLink: string;
  };
}

const LandingConfigSchema = new Schema<ILandingConfig>(
  {
    slug: { type: String, required: true, unique: true },
    logoUrl: { type: String, default: "/logo.png" },
    primaryColor: { type: String, default: "#2563eb" },
    hero: {
      backgroundImage: { type: String, default: "/images/hero-default.jpg" },
      title: { type: String, default: "Título Aquí" },
      subtitle: { type: String, default: "Subtítulo" },
      primaryButtonText: { type: String, default: "Comenzar" },
      primaryButtonLink: { type: String, default: "/contact" },
      secondaryButtonText: { type: String, default: "Explora Servicios" },
      secondaryButtonLink: { type: String, default: "#services" },
    },
    features: [
      {
        iconUrl: { type: String, default: "/images/icons/default.svg" },
        title: { type: String, default: "Servicio A" },
        description: { type: String, default: "Descripción A" },
      },
    ],
    portfolio: [
      {
        imageUrl: { type: String, default: "/images/port/1.jpg" },
        title: { type: String, default: "Proyecto X" },
        category: { type: String, default: "Web" },
      },
    ],
    stats: [
      {
        value: { type: String, default: "150" },
        label: { type: String, default: "Clientes satisfechos" },
      },
    ],
    testimonials: [
      {
        quote: { type: String, default: "Excelente servicio" },
        name: { type: String, default: "Juan Pérez" },
        role: { type: String, default: "CEO XYZ" },
        avatarUrl: { type: String, default: "/images/avatars/juan.png" },
        flagUrl: { type: String, default: "/images/flags/mx.png" },
      },
    ],
    clientLogos: [{ type: String, default: "/images/logos/placeholder.png" }],
    aboutText: {
      type: String,
      default:
        "Somos RivasDev, una agencia de servicios digitales especializados en soluciones corporativas y freelance remote. Nuestra misión es brindar calidad y soporte 24/7.",
    },
    mission: {
      type: String,
      default:
        "Empoderar a nuestros clientes con herramientas digitales de vanguardia que les permitan competir globalmente.",
    },
    vision: {
      type: String,
      default:
        "Ser la agencia líder en servicios remotos y corporativos, innovando continuamente en soluciones digitales.",
    },
    socialLinks: {
      github: { type: String, default: "https://github.com/YourGitHub" },
      linkedin: { type: String, default: "https://linkedin.com/in/YourProfile" },
      twitter: { type: String, default: "https://twitter.com/YourTwitter" },
      facebook: { type: String, default: "https://facebook.com/YourProfile" },
      instagram: { type: String, default: "https://instagram.com/YourProfile" },
    },
    contactInfo: {
      address: { type: String, default: "Calle Falsa 123, Ciudad, País" },
      phone: { type: String, default: "+1 (234) 567-890" },
      email: { type: String, default: "info@tudominio.com" },
    },
    footer: {
      copyrightText: {
        type: String,
        default: "© 2025 Rivas Technologies",
      },
      privacyLink: {
        type: String,
        default: "/privacy",
      },
      termsLink: {
        type: String,
        default: "/terms",
      },
    },
  },
  { timestamps: true } // añade createdAt y updatedAt
);

export default mongoose.models.LandingConfig ||
  mongoose.model<ILandingConfig>("LandingConfig", LandingConfigSchema);
