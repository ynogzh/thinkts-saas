import { useContext, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TenantsContext } from './tenants-provider'

export function TenantsDialogs() {
  const context = useContext(TenantsContext)
  if (!context) throw new Error('TenantsDialogs must be used within TenantsProvider')
  const { open, setOpen, currentRow, setCurrentRow, tenants, setTenants } = context

  const [form, setForm] = useState({ code: '', name: '', status: 'enabled' })
  const [editing, setEditing] = useState(false)

  function onOpenChange(open: boolean) {
    if (!open) {
      setOpen(null)
      setCurrentRow(null)
      setForm({ code: '', name: '', status: 'enabled' })
      setEditing(false)
    }
  }

  function handleAdd() {
    const newTenant = {
      id: Math.max(0, ...tenants.map((t) => t.id)) + 1,
      code: form.code,
      name: form.name,
      status: form.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTenants([...tenants, newTenant])
    onOpenChange(false)
  }

  function handleEdit() {
    if (!currentRow) return
    setTenants(
      tenants.map((t) =>
        t.id === currentRow.id
          ? { ...t, ...form, updatedAt: new Date().toISOString() }
          : t
      )
    )
    onOpenChange(false)
  }

  function handleDelete() {
    if (!currentRow) return
    setTenants(tenants.filter((t) => t.id !== currentRow.id))
    onOpenChange(false)
  }

  // Populate form when edit opens
  if (open === 'edit' && currentRow && !editing) {
    setForm({ code: currentRow.code, name: currentRow.name, status: currentRow.status })
    setEditing(true)
  }

  const isAddOpen = open === 'add'
  const isEditOpen = open === 'edit'
  const isDeleteOpen = open === 'delete'

  return (
    <>
      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAddOpen ? 'Add Tenant' : 'Edit Tenant'}</DialogTitle>
            <DialogDescription>
              {isAddOpen ? 'Create a new tenant.' : 'Update tenant details.'}
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='code' className='text-right'>Code</Label>
              <Input id='code' value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className='col-span-3' placeholder='e.g. demo'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>Name</Label>
              <Input id='name' value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className='col-span-3' placeholder='e.g. Demo Tenant'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>Status</Label>
              <div className='col-span-3 flex items-center gap-2'>
                <Switch id='status'
                  checked={form.status === 'enabled'}
                  onCheckedChange={(c) => setForm({ ...form, status: c ? 'enabled' : 'disabled' })}
                />
                <span className='text-sm text-muted-foreground'>
                  {form.status === 'enabled' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={isAddOpen ? handleAdd : handleEdit}>
              {isAddOpen ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      {currentRow && (
        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={onOpenChange}
          handleContinue={handleDelete}
          title='Delete Tenant'
          desc={`Are you sure you want to delete "${currentRow.name}"? This action cannot be undone.`}
        />
      )}
    </>
  )
}
