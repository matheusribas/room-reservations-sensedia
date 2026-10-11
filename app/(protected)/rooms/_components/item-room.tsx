import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Room } from "@/lib/types"
import Image from "next/image"

type ItemRoomProps = Omit<Room, "id">

export function ItemRoom(props: ItemRoomProps) {
  const { name, capacity, resources } = props
  return (
    <Card className="relative mx-auto w-full pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <Image
        width={120}
        height={120}
        alt="Imagem da sala"
        src="https://avatar.vercel.sh/shadcn1"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
          <Badge>
            Capacidade de <span className="font-bold">{capacity}</span> pessoas
          </Badge>
        </CardAction>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {resources.length ? (
            resources.map((resource) => (
              <Badge key={resource.id} className="capitalize" variant="outline">
                {resource.name}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sem recursos</p>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
