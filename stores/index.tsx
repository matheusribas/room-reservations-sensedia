import { User } from "@/lib/types"
import { create, type StateCreator } from "zustand"
import { persist } from "zustand/middleware"

interface AuthSlice {
  auth: User | null
  login: (user: User) => void
  logout: () => void
}

const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  auth: null,
  login: (user: User) => set(() => ({ auth: user })),
  logout: () => set(() => ({ auth: null })),
})

export const useBoundStore = create<AuthSlice>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
    }),
    { name: "auth-storage" }
  )
)
