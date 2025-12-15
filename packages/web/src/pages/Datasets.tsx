import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Download } from "lucide-react"
import { Link } from "react-router-dom"

export default function Datasets() {
  const { data, isLoading } = useQuery({
    queryKey: ["datasets"],
    queryFn: () => api.datasets.list(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Datasets</h1>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.items?.length ? (
              data.items.map((dataset: any) => (
                <TableRow key={dataset.id}>
                  <TableCell className="font-mono text-xs">{dataset.id}</TableCell>
                  <TableCell>{dataset.name || "-"}</TableCell>
                  <TableCell>{dataset.itemCount}</TableCell>
                  <TableCell>{new Date(dataset.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/datasets/${dataset.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={`http://localhost:3001/api/datasets/${dataset.id}/download?format=json`} target="_blank" download>
                        <Download className="size-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No datasets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
