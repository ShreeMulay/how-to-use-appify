import React from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Play } from "lucide-react"
import { toast } from "sonner"

// Simple Textarea component since we didn't fetch it
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  )
}

export default function ActorRunner() {
  const { actorId } = useParams<{ actorId: string }>()
  const decodedId = decodeURIComponent(actorId || "")
  const [inputJson, setInputJson] = React.useState("{}")
  const [activeRunId, setActiveRunId] = React.useState<string | null>(null)
  
  // Fetch Actor Details
  const { data: actor } = useQuery({
    queryKey: ["actor", decodedId],
    queryFn: () => api.actors.get(decodedId),
    enabled: !!decodedId,
  })

  // Fetch Input Schema (to prefill example)
  useQuery({
    queryKey: ["actor-schema", decodedId],
    queryFn: () => api.actors.getInputSchema(decodedId),
    enabled: !!decodedId,
  })

  // Set initial input from example if available
  React.useEffect(() => {
    if (actor?.curated?.exampleInput) {
      setInputJson(JSON.stringify(actor.curated.exampleInput, null, 2))
    }
  }, [actor])

  // Run Mutation
  const runMutation = useMutation({
    mutationFn: async () => {
      try {
        const input = JSON.parse(inputJson)
        return await api.actors.run(decodedId, input)
      } catch (e) {
        throw new Error("Invalid JSON input")
      }
    },
    onSuccess: (data) => {
      toast.success("Actor started successfully!")
      setActiveRunId(data.id)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  // Poll for run status
  const { data: runStatus } = useQuery({
    queryKey: ["run", activeRunId],
    queryFn: () => api.actors.getRun(decodedId, activeRunId!),
    enabled: !!activeRunId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === "RUNNING" || status === "READY" ? 1000 : false
    }
  })

  // Poll for logs
  const { data: logs } = useQuery({
    queryKey: ["run-logs", activeRunId],
    queryFn: () => api.actors.getRunLog(decodedId, activeRunId!),
    enabled: !!activeRunId,
    refetchInterval: 2000
  })

  if (!decodedId) return <div>Invalid Actor ID</div>

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{actor?.name || "Loading..."}</h1>
          <p className="text-muted-foreground">{actor?.description}</p>
        </div>
        {actor?.curated && (
          <Badge>{actor.curated.category}</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Configure actor input (JSON)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Textarea 
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="font-mono h-full resize-none"
              placeholder="{ ... }"
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => runMutation.mutate()} 
              disabled={runMutation.isPending || runStatus?.status === 'RUNNING'}
              className="w-full"
            >
              {runMutation.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Play className="mr-2 size-4" />
              )}
              {runStatus?.status === 'RUNNING' ? 'Running...' : 'Start Run'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Output
              {runStatus && (
                <Badge variant={runStatus.status === 'SUCCEEDED' ? 'default' : runStatus.status === 'RUNNING' ? 'secondary' : 'destructive'}>
                  {runStatus.status}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {activeRunId ? `Run ID: ${activeRunId}` : "Run execution logs will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 bg-muted/50 rounded-md mx-6 mb-6 p-0 overflow-hidden relative">
            <ScrollArea className="h-full w-full p-4 font-mono text-xs">
              {logs?.log || "Waiting for logs..."}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
