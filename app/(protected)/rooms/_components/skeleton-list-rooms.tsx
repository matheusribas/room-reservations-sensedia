import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonListRooms() {
  return (
    <div
      className="grid grid-cols-3 gap-6"
      role="status"
      aria-label="Carregando salas"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="mx-auto w-full pt-0">
          <Skeleton className="aspect-video w-full rounded-none" />
          <CardHeader>
            <CardAction>
              <Skeleton className="h-6 w-36 rounded-full" />
            </CardAction>
            <CardTitle>
              <Skeleton className="h-5 w-2/3" />
            </CardTitle>
            <CardDescription className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
