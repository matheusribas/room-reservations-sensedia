import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Room } from "@/lib/types"
import { Edit2Icon, CalendarDaysIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

type ItemRoomProps = Room

const SLICE_INDEX = 3

export function ItemRoom(props: ItemRoomProps) {
  const { id, name, capacity, resources } = props
  const router = useRouter()

  const rest = resources.slice(SLICE_INDEX) || []

  return (
    <Card className="relative mx-auto w-full pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35">
        <CardAction className="relative top-4 right-4 z-20">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/rooms/update/${id}`)}
                >
                  <Edit2Icon size={16} />
                </Button>
              }
            />
            <TooltipContent>Editar sala</TooltipContent>
          </Tooltip>
        </CardAction>
      </div>
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
        <CardDescription className="col-span-2 flex w-full gap-1">
          {resources.length ? (
            <Tooltip disabled={!rest.length}>
              <TooltipTrigger
                render={
                  <div className="space-x-2">
                    {resources.slice(0, SLICE_INDEX).map((resource) => (
                      <Badge
                        key={resource.id}
                        className="capitalize"
                        variant="outline"
                      >
                        {resource.name}
                      </Badge>
                    ))}
                    {rest.length ? <span>+{rest.length}</span> : null}
                  </div>
                }
              />
              <TooltipContent>
                {resources.map((r) => r.name).join(", ")}
              </TooltipContent>
            </Tooltip>
          ) : (
            <p className="text-sm text-muted-foreground">Sem recursos</p>
          )}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Link
          href={`/reservation/create?roomId=${id}`}
          className={buttonVariants({
            className: "w-full",
          })}
        >
          <CalendarDaysIcon /> Reservar sala
        </Link>
      </CardFooter>
    </Card>
  )
}
