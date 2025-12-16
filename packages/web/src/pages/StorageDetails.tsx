import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Database, Trash2, Search, Plus } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function StorageDetails() {
  const { storeId } = useParams()
  const queryClient = useQueryClient()
  const [searchKey, setSearchKey] = useState("")
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["storage", storeId],
    queryFn: () => api.storage.get(storeId || ""),
    enabled: !!storeId,
  })

  const { data: recordsData, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["storage", storeId, "records", searchKey],
    queryFn: () => api.storage.getKeys(storeId || "", 100, searchKey || undefined),
    enabled: !!storeId,
  })

  const createMutation = useMutation({
    mutationFn: (data: { key: string, value: any }) => 
      api.storage.setRecord(storeId || "", data.key, data.value),
    onSuccess: () => {
      toast.success("Record created")
      setIsCreateOpen(false)
      setNewKey("")
      setNewValue("")
      queryClient.invalidateQueries({ queryKey: ["storage", storeId, "records"] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create record")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (key: string) => api.storage.deleteRecord(storeId || "", key),
    onSuccess: () => {
      toast.success("Record deleted")
      queryClient.invalidateQueries({ queryKey: ["storage", storeId, "records"] })
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete record")
    }
  })

  const handleCreate = () => {
    try {
      const parsedValue = JSON.parse(newValue)
      createMutation.mutate({ key: newKey, value: parsedValue })
    } catch {
      // If not JSON, send as string or show error?
      // For KV store, value can be anything. But setRecord in client expects JSON or compatible.
      // Let's assume JSON for now or fallback to string.
      createMutation.mutate({ key: newKey, value: newValue })
    }
  }

  if (isLoadingStore) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    )
  }

  if (!store) return <div>Store not found</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to="/storage">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {store.name || "Unnamed Store"}
          </h1>
          <p className="text-muted-foreground mt-1 font-mono text-sm">
            ID: {store.id}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Created At
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(store.createdAt).toLocaleDateString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Modified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(store.modifiedAt).toLocaleDateString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((store.stats?.storageBytes || 0) / 1024).toFixed(2)} KB
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter keys..." 
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="h-8"
            />
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Record</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="key">Key</Label>
                  <Input id="key" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value (JSON)</Label>
                  <Textarea 
                    id="value" 
                    value={newValue} 
                    onChange={(e) => setNewValue(e.target.value)} 
                    className="font-mono"
                    rows={10}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingRecords ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[50px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : recordsData?.items?.length ? (
              recordsData.items.map((record: any) => (
                <TableRow key={record.key}>
                  <TableCell className="font-mono font-medium">{record.key}</TableCell>
                  <TableCell>{record.size} B</TableCell>
                  <TableCell className="text-muted-foreground">{record.contentType}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <RecordViewer storeId={storeId!} recordKey={record.key} />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(record.key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function RecordViewer({ storeId, recordKey }: { storeId: string, recordKey: string }) {
  const [open, setOpen] = useState(false)
  
  const { data, isLoading } = useQuery({
    queryKey: ["storage", storeId, "record", recordKey],
    queryFn: () => api.storage.getRecord(storeId, recordKey),
    enabled: open,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Database className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Record: {recordKey}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden mt-4 bg-slate-950 rounded-md">
          <ScrollArea className="h-[500px] w-full p-4">
            {isLoading ? (
              <div className="text-slate-400">Loading content...</div>
            ) : (
              <pre className="font-mono text-xs text-slate-50 whitespace-pre-wrap">
                {typeof data?.value === 'object' 
                  ? JSON.stringify(data.value, null, 2)
                  : String(data?.value || "")}
              </pre>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
