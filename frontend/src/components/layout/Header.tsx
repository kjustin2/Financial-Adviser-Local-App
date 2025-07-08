import { Button } from '@/components/ui/button'
import { PieChart, User } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          <PieChart className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold">Personal Finance Manager</h1>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Welcome back, User</span>
          </div>
          <Button variant="outline" size="sm">
            Settings
          </Button>
          <Button variant="ghost" size="sm">
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}