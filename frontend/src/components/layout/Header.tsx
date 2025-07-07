import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Financial Adviser</h1>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
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