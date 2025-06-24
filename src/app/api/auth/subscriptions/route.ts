import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db";
import Subscription from "@/models/Subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    const subscription = await Subscription.findOne({ user: session.user.id }).lean();
    return NextResponse.json({ subscription });
  } catch (err) {
    console.error("GET /api/subscriptions error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { plan, price, currency } = await request.json();
    await connectDB();

    // Generar checkout con Stripe aquí y obtener checkoutUrl...
    // const checkoutUrl = await createStripeCheckout(plan, price, currency, session.user.id);

    const sub = await Subscription.findOneAndUpdate(
      { user: session.user.id },
      { plan, price, currency, status: "active", startDate: new Date() },
      { upsert: true, new: true }
      );

    // Suponiendo que el modelo Subscription tenga un campo checkoutUrl
    return NextResponse.json({ subscription: sub, checkoutUrl: sub.checkoutUrl });
  } catch (err) {
    console.error("POST /api/subscriptions error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    await connectDB();
    await Subscription.findOneAndUpdate(
      { user: session.user.id },
      { status: "cancelled", endDate: new Date() }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/subscriptions error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}