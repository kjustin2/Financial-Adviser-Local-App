import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function ClientList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your financial advisory clients
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-4">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No clients yet</h3>
            <p className="text-sm mb-4">Get started by adding your first client</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Client
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Import the Users icon
import { Users } from 'lucide-react'