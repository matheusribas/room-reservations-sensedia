"use client"

import { useEffect, useSyncExternalStore } from "react"
import { useBoundStore } from "@/stores"
import { useMe } from "./use-me"

const subscribeHydration = (onStoreChange: () => void) =>
  useBoundStore.persist.onFinishHydration(onStoreChange)

const getHydrationSnapshot = () => useBoundStore.persist.hasHydrated()

export function useAuth() {
  const auth = useBoundStore((state) => state.auth)
  const login = useBoundStore((state) => state.login)
  const logout = useBoundStore((state) => state.logout)
  const hasHydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrationSnapshot,
    () => false
  )
  const shouldFetchUser = hasHydrated && !auth?.id
  const me = useMe(shouldFetchUser)

  useEffect(() => {
    if (!shouldFetchUser) return
    if (!me.isSuccess || me.isFetching) return

    if (me.data) {
      login(me.data)
    } else {
      logout()
    }
  }, [login, logout, me.data, me.isFetching, me.isSuccess, shouldFetchUser])

  const isAuthenticated = Boolean(auth?.id || me.data?.id)

  return {
    isAuthenticated,
    isLoading:
      !hasHydrated || (shouldFetchUser && (me.isPending || me.isFetching)),
    error: shouldFetchUser ? me.error : null,
    retry: me.refetch,
  }
}
