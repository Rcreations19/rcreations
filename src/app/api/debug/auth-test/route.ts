import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  const envPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const testPassword = '@Ravi1991';
  
  let bcryptMatch = false;
  let bcryptError = null;
  
  if (envPasswordHash) {
    try {
      bcryptMatch = await bcrypt.compare(testPassword, envPasswordHash);
    } catch (e) {
      bcryptError = String(e);
    }
  }
  
  return NextResponse.json({
    envPasswordHashSet: !!envPasswordHash,
    envPasswordHashLength: envPasswordHash?.length || 0,
    envPasswordHashPrefix: envPasswordHash?.substring(0, 20) || null,
    envPasswordHashSuffix: envPasswordHash?.slice(-20) || null,
    testPassword,
    bcryptMatch,
    bcryptError,
    hasTrailingNewline: envPasswordHash?.endsWith('\n') || false,
    hasTrailingSpace: envPasswordHash?.endsWith(' ') || false,
  });
}