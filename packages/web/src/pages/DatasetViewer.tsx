import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function DatasetViewer() {
  const { datasetId } = useParams<{ datasetId: string }>()
  
  const { data: dataset } = useQuery({
    queryKey: ["dataset", datasetId],
    queryFn: () => api.datasets.get(datasetId!),
    enabled: !!datasetId,
  })

  const { data: items, isLoading } = useQuery({
    queryKey: ["dataset-items", datasetId],
    queryFn: () => api.datasets.getItems(datasetId!),
    enabled: !!datasetId,
  })

  if (!datasetId) return <div>Invalid Dataset ID</div>

  const headers = items?.items?.length ? Object.keys(items.items[0]) : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dataset: {dataset?.name || datasetId}</h1>
          <p className="text-muted-foreground">{dataset?.itemCount} items</p>
        </div>
        <Button variant="outline" asChild>
          <a href={`http://localhost:3001/api/datasets/${datasetId}/download?format=json`} target="_blank" download>
            <Download className="mr-2 size-4" />
            Download JSON
          </a>
        </Button>
      </div>

      <div className="rounded-md border max-w-full overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.length > 0 ? (
                  headers.slice(0, 5).map(header => (
                    <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                  ))
                ) : (
                  <TableHead>Data</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    {headers.slice(0, 5).map((h) => (
                      <TableCell key={h}><Skeleton className="h-4 w-[100px]" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items?.items?.length ? (
                items.items.map((item: any, i: number) => (
                  <TableRow key={i}>
                    {headers.slice(0, 5).map((header) => (
                      <TableCell key={header} className="whitespace-nowrap max-w-[300px] truncate block">
                        {typeof item[header] === 'object' ? JSON.stringify(item[header]) : String(item[header])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length || 1} className="h-24 text-center">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
