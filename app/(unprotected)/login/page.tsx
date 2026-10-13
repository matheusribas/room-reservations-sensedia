"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/toast"
import { useLogin } from "@/hooks/auth/use-login"
import { useListUsers } from "@/hooks/users/use-list-users"
import { User } from "@/lib/types"
import { useBoundStore } from "@/stores"
import { useRouter } from "next/navigation"
import { useState } from "react"

const roles = {
  user: "usuário",
  admin: "administrador",
} as const

export default function LoginPage() {
  const router = useRouter()
  const login = useBoundStore((state) => state.login)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { data: users, isLoading } = useListUsers()
  const mutateLogin = useLogin()

  const handleLogin = () => {
    if (!selectedUser?.id) return

    mutateLogin.mutateAsync(selectedUser.id).then(
      () => {
        toast.add({
          type: "success",
          title: `Bem-vindo ${selectedUser.name.split(" ")[0]}!`,
        })
        router.push("/")
        login(selectedUser)
      },
      () => undefined
    )
  }

  const handleSelectUser = (userId: string) => {
    const user = users?.find((user) => user.id === userId)
    if (user) setSelectedUser(user)
  }

  return (
    <main className="flex h-dvh w-full flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col justify-end gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl">Acessar com usuário</h2>
        </div>
        <p className="text-muted-foreground">
          Selecione um usuário para acessar a aplicação
        </p>
      </div>

      <div className="flex min-h-68 w-full max-w-sm flex-col items-center justify-center gap-6">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando usuários...</p>
        ) : (
          <>
            <RadioGroup
              className="max-w-sm"
              value={selectedUser?.id || null}
              onValueChange={handleSelectUser}
            >
              {users?.map((user) => (
                <FieldLabel key={`user-${user.id}`} htmlFor={`user-${user.id}`}>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>{user.name}</FieldTitle>
                      <FieldDescription>
                        Acesso:{" "}
                        {user.role !== undefined
                          ? roles[user.role]
                          : "desconhecido"}
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem value={user.id} id={`user-${user.id}`} />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
            <Button
              className="w-full"
              size="lg"
              disabled={!selectedUser}
              onClick={handleLogin}
            >
              Acessar
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
