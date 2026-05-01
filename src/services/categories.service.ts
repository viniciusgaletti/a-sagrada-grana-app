import { supabase } from '@/services/supabase'
import type { Category } from '@/types'

export async function getCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('name', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map((cat) => ({
    id: cat.id,
    userId: cat.user_id,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    type: cat.type,
    archived: cat.archived,
    createdAt: cat.created_at,
  }))
}
