'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// ── Favourite Teams ──────────────────────────────────────
export function useFavouriteTeam(teamId) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!teamId) return
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return
      supabase
        .from('favourite_teams')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('team_id', teamId)
        .maybeSingle()
        .then(({ data: row }) => setIsFav(!!row))
    })
  }, [teamId])

  async function toggle(teamInfo) {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) return { needsAuth: true }

    setLoading(true)
    if (isFav) {
      await supabase
        .from('favourite_teams')
        .delete()
        .eq('user_id', authData.user.id)
        .eq('team_id', teamId)
      setIsFav(false)
    } else {
      await supabase.from('favourite_teams').insert({
        user_id: authData.user.id,
        team_id: teamId,
        team_name: teamInfo?.name || '',
        team_logo: teamInfo?.logo || '',
        sport: teamInfo?.sport || '',
        league: teamInfo?.league || '',
      })
      setIsFav(true)
    }
    setLoading(false)
    return { needsAuth: false }
  }

  return { isFav, toggle, loading }
}

// ── Favourite Players ────────────────────────────────────
export function useFavouritePlayer(playerId) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!playerId) return
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return
      supabase
        .from('favourite_players')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('player_id', playerId)
        .maybeSingle()
        .then(({ data: row }) => setIsFav(!!row))
    })
  }, [playerId])

  async function toggle(playerInfo) {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) return { needsAuth: true }

    setLoading(true)
    if (isFav) {
      await supabase
        .from('favourite_players')
        .delete()
        .eq('user_id', authData.user.id)
        .eq('player_id', playerId)
      setIsFav(false)
    } else {
      await supabase.from('favourite_players').insert({
        user_id: authData.user.id,
        player_id: playerId,
        player_name: playerInfo?.name || '',
        player_img: playerInfo?.img || '',
        sport: playerInfo?.sport || '',
      })
      setIsFav(true)
    }
    setLoading(false)
    return { needsAuth: false }
  }

  return { isFav, toggle, loading }
}

// ── Match Alerts ─────────────────────────────────────────
export function useMatchAlert(matchId) {
  const [hasAlert, setHasAlert] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!matchId) return
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) return
      supabase
        .from('match_alerts')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('match_id', matchId)
        .maybeSingle()
        .then(({ data: row }) => setHasAlert(!!row))
    })
  }, [matchId])

  async function toggle(matchInfo) {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) return { needsAuth: true }

    setLoading(true)
    if (hasAlert) {
      await supabase
        .from('match_alerts')
        .delete()
        .eq('user_id', authData.user.id)
        .eq('match_id', matchId)
      setHasAlert(false)
    } else {
      await supabase.from('match_alerts').insert({
        user_id: authData.user.id,
        match_id: matchId,
        match_name: matchInfo?.name || '',
        sport: matchInfo?.sport || '',
        alert_at: matchInfo?.date || null,
      })
      setHasAlert(true)
    }
    setLoading(false)
    return { needsAuth: false }
  }

  return { hasAlert, toggle, loading }
}

// ── Get all favourites for profile page ─────────────────
export async function getAllFavourites() {
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) return { teams: [], players: [], alerts: [] }

  const uid = authData.user.id
  const [teams, players, alerts] = await Promise.all([
    supabase.from('favourite_teams').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('favourite_players').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    supabase.from('match_alerts').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
  ])

  return {
    teams: teams.data || [],
    players: players.data || [],
    alerts: alerts.data || [],
  }
}
