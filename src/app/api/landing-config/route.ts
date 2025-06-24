// src/app/api/landing-config/route.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import LandingConfig, { ILandingConfig } from "@/models/LandingConfig.model";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "";

// ─────────────────────────────────────────────
// Helper para obtener o crear la configuración
// ─────────────────────────────────────────────
async function getOrCreateLandingConfig(slug: string): Promise<ILandingConfig> {
  console.log("[LandingConfig] Conectando a DB...");
  await connectDB();

  console.log(`[LandingConfig] Buscando configuración con slug: ${slug}`);
  const config = await LandingConfig.findOne({ slug });

  if (!config) {
    console.log("[LandingConfig] No encontrada, creando nueva configuración...");
    const newConfig = await LandingConfig.create({ slug });
    console.log("[LandingConfig] Configuración creada:", newConfig);
    return newConfig.toObject();
  }

  console.log("[LandingConfig] Configuración encontrada:", config);
  return config.toObject();
}

// ─────────────────────────────────────────────
// GET: Devuelve configuración pública
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "home";
    console.log("[GET] Slug recibido:", slug);

    const config = await getOrCreateLandingConfig(slug);

    console.log("[GET] Configuración final enviada:", config);
    return NextResponse.json(config, { status: 200 });
  } catch (error: any) {
    console.error("[API][LandingConfig][GET] Error:", error);
    return NextResponse.json(
      { error: "Error al cargar configuración de landing" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────
// PUT: Actualiza configuración (requiere admin)
// ─────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    console.log("[PUT] Validando token...");
    const token = await getToken({ req, secret: NEXTAUTH_SECRET });
    console.log("[PUT] Token recibido:", token);

    if (!token || token.role !== "admin") {
      console.warn("[PUT] Token inválido o no es admin");
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "home";
    console.log("[PUT] Slug recibido:", slug);

    const body = (await req.json()) as ILandingConfig;
    console.log("[PUT] Body recibido:", body);

    if (body.slug !== slug) {
      console.warn("[PUT] Slug en body no coincide con parámetro");
      return NextResponse.json(
        { error: "El slug del body no coincide con el parámetro" },
        { status: 400 }
      );
    }

    console.log("[PUT] Conectando a DB...");
    await connectDB();

    console.log("[PUT] Actualizando configuración...");
    const updated = await LandingConfig.findOneAndUpdate(
      { slug },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    ).lean<ILandingConfig | null>();

    if (!updated) {
      console.error("[PUT] No se pudo guardar la configuración");
      return NextResponse.json(
        { error: "No se pudo guardar la configuración" },
        { status: 500 }
      );
    }

    console.log("[PUT] Configuración actualizada:", updated);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("[API][LandingConfig][PUT] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración de landing" },
      { status: 500 }
    );
  }
}
