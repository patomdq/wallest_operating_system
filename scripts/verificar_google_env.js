/**
 * Script de verificación de variables de entorno de Google Calendar
 * Ejecutar con: node scripts/verificar_google_env.js
 * 
 * NOTA: Este script lee de process.env, que en desarrollo local
 * no carga .env.local automáticamente a menos que uses dotenv.
 * 
 * En producción (Vercel), las variables se leen del dashboard.
 */

// Intentar cargar dotenv si está disponible
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.log('⚠️  dotenv no está instalado - solo se mostrarán variables del sistema\n');
}

console.log('🔍 Verificando configuración de Google Calendar OAuth\n');
console.log('='.repeat(60));

// Verificar GOOGLE_CLIENT_ID
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
console.log('\n1️⃣ NEXT_PUBLIC_GOOGLE_CLIENT_ID:');
if (clientId) {
  console.log('   ✅ Definido');
  console.log(`   📝 Valor: ${clientId.substring(0, 30)}...`);
  console.log(`   📏 Longitud: ${clientId.length} caracteres`);
  
  if (clientId.endsWith('.apps.googleusercontent.com')) {
    console.log('   ✅ Formato correcto (.apps.googleusercontent.com)');
  } else {
    console.log('   ⚠️  Formato inusual - debería terminar en .apps.googleusercontent.com');
  }
} else {
  console.log('   ❌ NO DEFINIDO');
  console.log('   💡 Agrega esta variable a tu .env.local');
}

// Verificar GOOGLE_CLIENT_SECRET
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
console.log('\n2️⃣ GOOGLE_CLIENT_SECRET:');
if (clientSecret) {
  console.log('   ✅ Definido');
  console.log('   🔒 Valor oculto por seguridad');
  console.log(`   📏 Longitud: ${clientSecret.length} caracteres`);
} else {
  console.log('   ❌ NO DEFINIDO');
  console.log('   💡 Agrega esta variable a tu .env.local');
  console.log('   ⚠️  NO uses NEXT_PUBLIC_ para el secret (debe ser privado)');
}

// Verificar el antiguo NEXT_PUBLIC_GOOGLE_CLIENT_SECRET (no debería existir)
const oldClientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
if (oldClientSecret) {
  console.log('\n⚠️  ADVERTENCIA: NEXT_PUBLIC_GOOGLE_CLIENT_SECRET está definido');
  console.log('   ❌ Esto expone tu secret al navegador');
  console.log('   💡 Renómbralo a GOOGLE_CLIENT_SECRET (sin NEXT_PUBLIC_)');
}

// Verificar GOOGLE_REDIRECT_URI
const redirectUri = process.env.GOOGLE_REDIRECT_URI;
console.log('\n3️⃣ GOOGLE_REDIRECT_URI:');
if (redirectUri) {
  console.log('   ✅ Definido');
  console.log(`   📝 Valor: ${redirectUri}`);
  
  if (redirectUri.includes('localhost')) {
    console.log('   💻 Apunta a desarrollo local');
  } else if (redirectUri.includes('vercel.app')) {
    console.log('   ☁️  Apunta a producción (Vercel)');
  }
  
  if (redirectUri.endsWith('/api/google/callback')) {
    console.log('   ✅ Path correcto (/api/google/callback)');
  } else {
    console.log('   ⚠️  Path inusual - debería terminar en /api/google/callback');
  }
} else {
  console.log('   ⚠️  NO DEFINIDO - se usará el valor por defecto');
  console.log('   💡 Recomendado: definirlo explícitamente');
}

// Resumen
console.log('\n' + '='.repeat(60));
console.log('\n📊 RESUMEN:\n');

let allGood = true;

if (!clientId) {
  console.log('❌ Falta NEXT_PUBLIC_GOOGLE_CLIENT_ID');
  allGood = false;
}

if (!clientSecret) {
  console.log('❌ Falta GOOGLE_CLIENT_SECRET');
  allGood = false;
}

if (oldClientSecret) {
  console.log('⚠️  Renombrar NEXT_PUBLIC_GOOGLE_CLIENT_SECRET → GOOGLE_CLIENT_SECRET');
  allGood = false;
}

if (!redirectUri) {
  console.log('⚠️  Definir GOOGLE_REDIRECT_URI explícitamente (recomendado)');
}

if (allGood && clientId && clientSecret) {
  console.log('✅ Todas las variables necesarias están configuradas');
  console.log('\n📋 SIGUIENTE PASO:');
  console.log('   1. Verifica que estas mismas variables estén en Vercel');
  console.log('   2. Confirma que el redirect_uri esté en Google Console');
  console.log('   3. Verifica que client_id y client_secret sean del MISMO OAuth Client');
}

console.log('\n' + '='.repeat(60) + '\n');
