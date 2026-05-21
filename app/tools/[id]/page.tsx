import { supabase } from '@/lib/supabase';
import ToolDetailClient from './ToolDetailClient';

export async function generateStaticParams() {
  try {
    const { data } = await supabase.from('tools').select('id');
    return (data || []).map((t: { id: string }) => ({ id: t.id }));
  } catch {
    return [];
  }
}

export default async function ToolDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ToolDetailClient id={id} />;
}
