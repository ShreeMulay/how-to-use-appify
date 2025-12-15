import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { PopularActor } from "@/types"

interface ActorCardProps {
  actor: PopularActor
}

export function ActorCard({ actor }: ActorCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="line-clamp-1 text-lg">{actor.name}</CardTitle>
          <Badge variant="outline" className="shrink-0">{actor.category}</Badge>
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {actor.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex gap-2 mb-4">
          <Badge variant="secondary" className="capitalize">{actor.difficulty}</Badge>
          <Badge variant="secondary" className="capitalize">{actor.estimatedCost} Cost</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" size="sm" asChild className="w-full">
          <a href={actor.documentationUrl} target="_blank" rel="noopener noreferrer">Docs</a>
        </Button>
        <Button size="sm" asChild className="w-full">
          <Link to={`/actors/${encodeURIComponent(actor.id)}`}>Run</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
