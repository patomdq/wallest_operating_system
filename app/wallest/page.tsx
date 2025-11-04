import { redirect } from 'next/navigation';

export default function WallestPage() {
  // Redirigir al área de activos como página principal de Wallest
  redirect('/wallest/activos');
}
