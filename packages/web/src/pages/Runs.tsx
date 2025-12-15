import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function Runs() {
  const { data, isLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: () => api.runs.list(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Recent Runs</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Run ID</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                </TableRow>
              ))
            ) : data?.items?.length ? (
              data.items.map((run: any) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <Badge variant={run.status === 'SUCCEEDED' ? 'default' : run.status === 'RUNNING' ? 'secondary' : 'destructive'}>
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{run.id}</TableCell>
                  <TableCell>{run.actId.split('/').pop() || run.actId}</TableCell>
                  <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {run.finishedAt 
                      ? `${Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s` 
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No runs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
