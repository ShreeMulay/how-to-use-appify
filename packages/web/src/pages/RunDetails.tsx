import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"

export default function RunDetails() {
  const { runId } = useParams()
  const queryClient = useQueryClient()

  const { data: run, isLoading: isLoadingRun } = useQuery({
    queryKey: ["runs", runId],
    queryFn: () => api.runs.get(runId || ""),
    enabled: !!runId,
    refetchInterval: (data) => 
      data?.status === "RUNNING" || data?.status === "READY" ? 1000 : false,
  })

  const { data: logData, isLoading: isLoadingLog } = useQuery({
    queryKey: ["runs", runId, "log"],
    queryFn: () => api.runs.getLog(runId || ""),
    enabled: !!runId,
    refetchInterval: (data) => (run?.status === "RUNNING" ? 2000 : false),
  })

  const abortMutation = useMutation({
    mutationFn: () => api.runs.abort(runId || ""),
    onSuccess: () => {
      toast.success("Run aborted")
      queryClient.invalidateQueries({ queryKey: ["runs", runId] })
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const resurrectMutation = useMutation({
    mutationFn: () => api.runs.resurrect(runId || ""),
    onSuccess: () => {
      toast.success("Run resurrected")
      queryClient.invalidateQueries({ queryKey: ["runs", runId] })
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  if (isLoadingRun) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (!run) return <div>Run not found</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/runs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Run {run.id}
            <Badge variant={run.status === 'SUCCEEDED' ? 'default' : run.status === 'RUNNING' ? 'secondary' : 'destructive'}>
              {run.status}
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">
            Actor: {run.actId} | Build: {run.buildNumber}
          </p>
        </div>
        <div className="flex gap-2">
          {run.status === "RUNNING" && (
            <Button variant="destructive" onClick={() => abortMutation.mutate()} disabled={abortMutation.isPending}>
              <XCircle className="mr-2 h-4 w-4" /> Abort
            </Button>
          )}
          {(run.status === "ABORTED" || run.status === "FAILED" || run.status === "TIMED-OUT") && (
            <Button onClick={() => resurrectMutation.mutate()} disabled={resurrectMutation.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" /> Resurrect
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Started</p>
                <p>{new Date(run.startedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Finished</p>
                <p>{run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p>{run.stats?.durationMillis ? `${(run.stats.durationMillis / 1000).toFixed(2)}s` : "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Compute Units</p>
                <p>{run.stats?.computeUnits || 0} CU</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start w-full" asChild>
              <Link to={`/datasets/${run.defaultDatasetId}`}>
                Dataset ({run.usage?.DATASET_WRITES || 0} items)
              </Link>
            </Button>
            <Button variant="outline" className="justify-start w-full" asChild>
              <Link to={`/storage/${run.defaultKeyValueStoreId}`}>
                Key-Value Store
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="input">Input</TabsTrigger>
        </TabsList>
        <TabsContent value="log">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] w-full bg-slate-950 p-4 font-mono text-xs text-slate-50 rounded-md">
                {isLoadingLog ? "Loading log..." : <pre className="whitespace-pre-wrap">{logData?.log || "No log available"}</pre>}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="input">
           <Card>
             <CardContent className="p-4">
               <pre className="text-sm overflow-auto">{JSON.stringify(run.options, null, 2)}</pre>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
