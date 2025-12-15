import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Box, Play, Database } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
  const { data: runs } = useQuery({ queryKey: ['runs', { limit: 5 }], queryFn: () => api.runs.list(5) })
  const { data: actors } = useQuery({ queryKey: ['actors', { popular: true }], queryFn: () => api.actors.listPopular() })
  const { data: datasets } = useQuery({ queryKey: ['datasets', { limit: 1 }], queryFn: () => api.datasets.list(1) })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Popular Actors</CardTitle>
            <Box className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actors?.meta?.total || 0}</div>
            <p className="text-muted-foreground text-xs">Curated for learning</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Runs</CardTitle>
            <Play className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runs?.total || 0}</div>
            <p className="text-muted-foreground text-xs">Total execution runs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Datasets</CardTitle>
            <Database className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasets?.total || 0}</div>
            <p className="text-muted-foreground text-xs">Data collections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-muted-foreground text-xs">API Connected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your recent actor runs and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {runs?.items?.map((run) => (
                  <div key={run.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {run.actId.split('/').pop() || run.actId}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(run.startedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={run.status === 'SUCCEEDED' ? 'default' : run.status === 'RUNNING' ? 'secondary' : 'destructive'}>
                            {run.status}
                        </Badge>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to={`/runs/${run.id}`}>View</Link>
                        </Button>
                    </div>
                  </div>
                ))}
                {!runs?.items?.length && (
                    <div className="text-center text-muted-foreground py-8">
                        No runs yet. Try running an actor!
                    </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recommended to Start</CardTitle>
            <CardDescription>
              Beginner-friendly actors to try out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {actors?.data?.slice(0, 3).map((actor: any) => (
                    <div key={actor.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">{actor.name}</p>
                            <p className="text-muted-foreground text-xs line-clamp-1">{actor.description}</p>
                        </div>
                        <Button size="sm" asChild>
                            <Link to={`/actors/${encodeURIComponent(actor.id)}`}>Try</Link>
                        </Button>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
