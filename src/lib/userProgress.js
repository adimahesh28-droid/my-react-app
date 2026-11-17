import { supabase } from './supabase'

export async function loadUserProgress(userId, progressKey) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('progress_data')
    .eq('user_id', userId)
    .eq('progress_key', progressKey)
    .maybeSingle()

  if (error) throw error
  return data?.progress_data || {}
}

export async function loadUserProgressKeys(userId, progressKeys) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('progress_key, progress_data')
    .eq('user_id', userId)
    .in('progress_key', progressKeys)

  if (error) throw error
  return Object.fromEntries((data || []).map(row => [row.progress_key, row.progress_data || {}]))
}

export async function saveUserProgress(userId, progressKey, progressData) {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      progress_key: progressKey,
      progress_data: progressData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,progress_key' })

  if (error) throw error
}
