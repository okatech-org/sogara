import { useState, useMemo } from 'react'
import { Users, Building, Briefcase, Search, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Employee, UserRole } from '@/types'

interface HSERecipientSelectorProps {
  employees: Employee[]
  onSelectionChange: (selectedIds: string[]) => void
  preSelectedIds?: string[]
}

export function HSERecipientSelector({
  employees,
  onSelectionChange,
  preSelectedIds = [],
}: HSERecipientSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(preSelectedIds)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])

  // Debug
  console.log('👥 HSERecipientSelector - Employés reçus:', employees.length)
  console.log('📋 Services détectés:', [...new Set(employees.map(e => e.service))])

  const services = useMemo(() => [...new Set(employees.map(e => e.service))].sort(), [employees])

  const roles: UserRole[] = [
    'EMPLOYE',
    'SUPERVISEUR',
    'HSE',
    'ADMIN',
    'RECEP',
    'COMMUNICATION',
    'DG',
    'DRH',
  ]

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch =
        searchTerm === '' ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.service.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [employees, searchTerm])

  const employeesByService = useMemo(() => {
    const grouped: Record<string, Employee[]> = {}
    filteredEmployees.forEach(emp => {
      if (!grouped[emp.service]) grouped[emp.service] = []
      grouped[emp.service].push(emp)
    })
    return grouped
  }, [filteredEmployees])

  const employeesByRole = useMemo(() => {
    const grouped: Record<string, Employee[]> = {}
    roles.forEach(role => {
      grouped[role] = filteredEmployees.filter(emp => emp.roles.includes(role))
    })
    return grouped
  }, [filteredEmployees, roles])

  const toggleEmployee = (empId: string) => {
    const updated = selectedIds.includes(empId)
      ? selectedIds.filter(id => id !== empId)
      : [...selectedIds, empId]
    setSelectedIds(updated)
    onSelectionChange(updated)
  }

  const toggleService = (service: string) => {
    const serviceEmployees = employeesByService[service] || []
    const serviceIds = serviceEmployees.map(e => e.id)
    const allSelected = serviceIds.every(id => selectedIds.includes(id))

    let updated: string[]
    if (allSelected) {
      updated = selectedIds.filter(id => !serviceIds.includes(id))
    } else {
      updated = [...new Set([...selectedIds, ...serviceIds])]
    }

    setSelectedIds(updated)
    onSelectionChange(updated)
  }

  const toggleRole = (role: UserRole) => {
    const roleEmployees = employeesByRole[role] || []
    const roleIds = roleEmployees.map(e => e.id)
    const allSelected = roleIds.every(id => selectedIds.includes(id))

    let updated: string[]
    if (allSelected) {
      updated = selectedIds.filter(id => !roleIds.includes(id))
    } else {
      updated = [...new Set([...selectedIds, ...roleIds])]
    }

    setSelectedIds(updated)
    onSelectionChange(updated)
  }

  const selectAll = () => {
    const allIds = filteredEmployees.map(e => e.id)
    setSelectedIds(allIds)
    onSelectionChange(allIds)
  }

  const clearSelection = () => {
    setSelectedIds([])
    onSelectionChange([])
  }

  return (
    <div className="space-y-4">
      {/* En-tête avec compteur */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Sélection des destinataires</h3>
          <Badge variant="secondary">
            {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={selectAll}>
            Tout sélectionner
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, matricule ou service..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sélection par critères */}
      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual">
            <Users className="w-4 h-4 mr-2" />
            Individuel
          </TabsTrigger>
          <TabsTrigger value="service">
            <Building className="w-4 h-4 mr-2" />
            Par Service
          </TabsTrigger>
          <TabsTrigger value="role">
            <Briefcase className="w-4 h-4 mr-2" />
            Par Rôle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-3">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun employé trouvé</p>
              <p className="text-xs mt-1">Vérifiez que les employés sont chargés dans le système</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] border rounded-md p-3">
              <div className="space-y-2">
                {filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted/30 rounded transition-colors"
                  >
                    <Checkbox
                      id={employee.id}
                      checked={selectedIds.includes(employee.id)}
                      onCheckedChange={() => toggleEmployee(employee.id)}
                    />
                    <label htmlFor={employee.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.matricule} • {employee.service}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {employee.roles.map(role => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="service" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map(service => {
              const serviceEmployees = employeesByService[service] || []
              const serviceIds = serviceEmployees.map(e => e.id)
              const allSelected = serviceIds.every(id => selectedIds.includes(id))
              const someSelected = serviceIds.some(id => selectedIds.includes(id)) && !allSelected

              return (
                <Card
                  key={service}
                  className={`cursor-pointer transition-all ${
                    allSelected
                      ? 'border-primary bg-primary/5'
                      : someSelected
                        ? 'border-primary/50'
                        : ''
                  }`}
                  onClick={() => toggleService(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={allSelected} className="pointer-events-none" />
                        <div>
                          <p className="font-medium">{service}</p>
                          <p className="text-xs text-muted-foreground">
                            {serviceEmployees.length} employé
                            {serviceEmployees.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant={allSelected ? 'default' : 'outline'}>
                        {serviceIds.filter(id => selectedIds.includes(id)).length}/
                        {serviceEmployees.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="role" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map(role => {
              const roleEmployees = employeesByRole[role] || []
              const roleIds = roleEmployees.map(e => e.id)
              const allSelected = roleIds.every(id => selectedIds.includes(id))
              const someSelected = roleIds.some(id => selectedIds.includes(id)) && !allSelected

              if (roleEmployees.length === 0) return null

              return (
                <Card
                  key={role}
                  className={`cursor-pointer transition-all ${
                    allSelected
                      ? 'border-primary bg-primary/5'
                      : someSelected
                        ? 'border-primary/50'
                        : ''
                  }`}
                  onClick={() => toggleRole(role)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox checked={allSelected} className="pointer-events-none" />
                        <div>
                          <p className="font-medium">{role}</p>
                          <p className="text-xs text-muted-foreground">
                            {roleEmployees.length} employé{roleEmployees.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <Badge variant={allSelected ? 'default' : 'outline'}>
                        {roleIds.filter(id => selectedIds.includes(id)).length}/
                        {roleEmployees.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Résumé sélection */}
      {selectedIds.length > 0 && (
        <Card className="bg-primary/5 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">
                  {selectedIds.length} collaborateur{selectedIds.length > 1 ? 's' : ''} sélectionné
                  {selectedIds.length > 1 ? 's' : ''}
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Effacer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
