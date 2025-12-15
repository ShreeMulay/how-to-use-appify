import React from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { ActorCard } from "@/components/actors/ActorCard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PopularActor } from "@/types"

export default function ActorExplorer() {
  const [search, setSearch] = React.useState("")
  const [category, setCategory] = React.useState<string>("all")

  const { data: actors, isLoading } = useQuery({
    queryKey: ["actors", { popular: true, search, category }],
    queryFn: () => api.actors.listPopular(category === "all" ? undefined : category),
  })

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.actors.getCategories(),
  })

  // Client-side filtering for search (since our API is simple mock-ish for search)
  const filteredActors = React.useMemo(() => {
    if (!actors?.data) return []
    if (!search) return actors.data
    return actors.data.filter((actor: PopularActor) => 
      actor.name.toLowerCase().includes(search.toLowerCase()) ||
      actor.description.toLowerCase().includes(search.toLowerCase())
    )
  }, [actors, search])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Explore Actors</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Input 
            placeholder="Search actors..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-[300px]"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActors.map((actor: PopularActor) => (
            <ActorCard key={actor.id} actor={actor} />
          ))}
          {filteredActors.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No actors found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
