import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function DELETE() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Elimina los datos del método de pago
    user.hasValidPaymentMethod = false;
    user.paymentMethodDetails = undefined;

    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Remove payment method error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
