import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateMedicineBatchRequest, Medicine, MedicineBatch, UpdateMedicineBatchRequest } from "@/generated/models";
import { useCreateMedicineBatch, useDeleteMedicineBatch, useListMedicineBatches, useUpdateMedicineBatch } from "@/generated/medicine-batches/medicine-batches";
import { getListMedicinesQueryKey, useListMedicineStockActivities } from "@/generated/medicines/medicines";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface MedicineBatchesDialogProps {
  medicine: Medicine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BatchFormState = {
  batch_number: string;
  expiration_date: string;
  stock: string;
  unit: string;
  minimum_stock: string;
};

const emptyForm = (medicine: Medicine): BatchFormState => ({
  batch_number: "",
  expiration_date: "",
  stock: "0",
  unit: medicine.dosage_form ?? "unit",
  minimum_stock: "0",
});

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active") return "default";
  if (status === "depleted") return "destructive";
  return "secondary";
}

function toUpdatePayload(form: BatchFormState): UpdateMedicineBatchRequest {
  return {
    batch_number: form.batch_number,
    expiration_date: form.expiration_date,
    stock: Number(form.stock),
    unit: form.unit,
    minimum_stock: Number(form.minimum_stock),
  };
}

function toCreatePayload(medicineId: string, form: BatchFormState): CreateMedicineBatchRequest {
  return {
    medicine_id: medicineId,
    ...toUpdatePayload(form),
  };
}

function toForm(batch: MedicineBatch): BatchFormState {
  return {
    batch_number: batch.batch_number,
    expiration_date: batch.expiration_date,
    stock: String(batch.stock),
    unit: batch.unit,
    minimum_stock: String(batch.minimum_stock),
  };
}

export function MedicineBatchesDialog({ medicine, open, onOpenChange }: MedicineBatchesDialogProps) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editBatch, setEditBatch] = useState<MedicineBatch | null>(null);
  const [sourceFilter, setSourceFilter] = useState<"" | "admin" | "patient_checkup">("");
  const [createForm, setCreateForm] = useState<BatchFormState>(() => emptyForm(medicine));
  const [editForm, setEditForm] = useState<BatchFormState>(() => emptyForm(medicine));

  const { data: batchResp, isLoading: batchLoading } = useListMedicineBatches(
    { page: 1, per_page: 100, medicine_id: medicine.id },
    { query: { enabled: open } },
  );
  const { data: activityResp, isLoading: activityLoading } = useListMedicineStockActivities(
    medicine.id,
    { page: 1, per_page: 100, source: sourceFilter || undefined },
    { query: { enabled: open } },
  );

  const createMutation = useCreateMedicineBatch({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() }),
          queryClient.invalidateQueries({ queryKey: ["/medicine-batches"] }),
          queryClient.invalidateQueries({ queryKey: [`/medicines/${medicine.id}/stock-activities`] }),
        ]);
        setCreateOpen(false);
        setCreateForm(emptyForm(medicine));
        toast.success("Batch created");
      },
      onError: (error) => toast.error(`Failed to create batch: ${error.message}`),
    },
  });

  const updateMutation = useUpdateMedicineBatch({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() }),
          queryClient.invalidateQueries({ queryKey: ["/medicine-batches"] }),
          queryClient.invalidateQueries({ queryKey: [`/medicines/${medicine.id}/stock-activities`] }),
        ]);
        setEditBatch(null);
        toast.success("Batch updated");
      },
      onError: (error) => toast.error(`Failed to update batch: ${error.message}`),
    },
  });

  const deleteMutation = useDeleteMedicineBatch({
    mutation: {
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: getListMedicinesQueryKey() }),
          queryClient.invalidateQueries({ queryKey: ["/medicine-batches"] }),
          queryClient.invalidateQueries({ queryKey: [`/medicines/${medicine.id}/stock-activities`] }),
        ]);
        toast.success("Batch deleted");
      },
      onError: (error) => toast.error(`Failed to delete batch: ${error.message}`),
    },
  });

  const batches = batchResp?.data ?? [];
  const activities = useMemo(() => activityResp?.data ?? [], [activityResp]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Stock: {medicine.name}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="text-sm text-muted-foreground">
              Current stock: <span className="font-semibold text-foreground">{medicine.current_stock}</span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setCreateForm(emptyForm(medicine));
                setCreateOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Batch
            </Button>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="border-b bg-muted px-3 py-2 text-sm font-medium">Medicine Batches</div>
            {batchLoading ? (
              <div className="p-3 text-sm text-muted-foreground">Loading batches...</div>
            ) : batches.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No batch data.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="p-2 text-left">Batch</th>
                    <th className="p-2 text-left">Expiration</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Min Stock</th>
                    <th className="p-2 text-left">Unit</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Updated</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="border-t">
                      <td className="p-2 font-medium">{batch.batch_number}</td>
                      <td className="p-2">{formatDate(batch.expiration_date)}</td>
                      <td className="p-2">{batch.stock}</td>
                      <td className="p-2">{batch.minimum_stock}</td>
                      <td className="p-2">{batch.unit}</td>
                      <td className="p-2">
                        <Badge variant={statusVariant(batch.status)}>{batch.status}</Badge>
                      </td>
                      <td className="p-2">{formatDateTime(batch.updated_at)}</td>
                      <td className="p-2">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setEditBatch(batch);
                              setEditForm(toForm(batch));
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate({ id: batch.id })}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="flex items-center justify-between border-b bg-muted px-3 py-2">
              <span className="text-sm font-medium">Stock Activity Log</span>
              <div className="flex items-center gap-2">
                <Button variant={sourceFilter === "" ? "default" : "outline"} size="sm" onClick={() => setSourceFilter("")}>All</Button>
                <Button variant={sourceFilter === "admin" ? "default" : "outline"} size="sm" onClick={() => setSourceFilter("admin")}>Admin</Button>
                <Button
                  variant={sourceFilter === "patient_checkup" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSourceFilter("patient_checkup")}
                >
                  Checkup
                </Button>
              </div>
            </div>
            {activityLoading ? (
              <div className="p-3 text-sm text-muted-foreground">Loading stock activities...</div>
            ) : activities.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No stock activity yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Source</th>
                    <th className="p-2 text-left">Change</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Batch</th>
                    <th className="p-2 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id} className="border-t">
                      <td className="p-2">{formatDateTime(activity.created_at)}</td>
                      <td className="p-2">{activity.source}</td>
                      <td className={`p-2 font-medium ${activity.quantity_delta < 0 ? "text-destructive" : "text-emerald-600"}`}>
                        {activity.quantity_delta > 0 ? `+${activity.quantity_delta}` : activity.quantity_delta}
                      </td>
                      <td className="p-2">{activity.stock_before} → {activity.stock_after}</td>
                      <td className="p-2">{activity.medicine_batch_id ? activity.medicine_batch_id.slice(0, 8) : "-"}</td>
                      <td className="p-2">{activity.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Batch</DialogTitle>
          </DialogHeader>
          <BatchForm form={createForm} onChange={setCreateForm} />
          <Button
            onClick={() => createMutation.mutate({ data: toCreatePayload(medicine.id, createForm) })}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Save Batch"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editBatch} onOpenChange={(state) => !state && setEditBatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
          </DialogHeader>
          <BatchForm form={editForm} onChange={setEditForm} />
          <Button
            onClick={() => editBatch && updateMutation.mutate({ id: editBatch.id, data: toUpdatePayload(editForm) })}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Update Batch"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BatchForm({
  form,
  onChange,
}: {
  form: BatchFormState;
  onChange: (value: BatchFormState) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="space-y-2">
        <Label>Batch Number</Label>
        <Input value={form.batch_number} onChange={(e) => onChange({ ...form, batch_number: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Expiration Date</Label>
        <Input type="date" value={form.expiration_date} onChange={(e) => onChange({ ...form, expiration_date: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Stock</Label>
        <Input type="number" min={0} value={form.stock} onChange={(e) => onChange({ ...form, stock: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Minimum Stock</Label>
        <Input
          type="number"
          min={0}
          value={form.minimum_stock}
          onChange={(e) => onChange({ ...form, minimum_stock: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Unit</Label>
        <Input value={form.unit} onChange={(e) => onChange({ ...form, unit: e.target.value })} />
      </div>
    </div>
  );
}
