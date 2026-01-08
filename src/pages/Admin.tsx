import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useGrievances, DbGrievance, useUpdateGrievanceStatus, useAssignGrievance } from "@/hooks/useGrievances";
import { supabase } from "@/integrations/supabase/client";
import { useStaff } from "@/hooks/useStaff";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Search, MessageSquare, Shield, CheckSquare, X } from "lucide-react";
import { AdminCommentsDialog } from "@/components/admin/AdminCommentsDialog";
import { toast } from "@/hooks/use-toast";

interface ProfileCache {
  [key: string]: { name: string | null; email: string };
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, profile, role, signOut, isLoading } = useAuth();
  const { data: grievances, isLoading: grievancesLoading } = useGrievances();
  const { data: staff, isLoading: staffLoading } = useStaff();
  const updateStatus = useUpdateGrievanceStatus();
  const assignGrievance = useAssignGrievance();
  
  const [search, setSearch] = useState("");
  const [profileCache, setProfileCache] = useState<ProfileCache>({});
  const [selectedGrievance, setSelectedGrievance] = useState<DbGrievance | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    } else if (!isLoading && user && role !== 'admin') {
      navigate('/dashboard');
      toast({
        title: "Access Denied",
        description: "Only admins can access this page.",
        variant: "destructive"
      });
    }
  }, [user, role, isLoading, navigate]);

  // Fetch profile names for user_ids
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!grievances) return;
      
      const userIds = [...new Set(grievances.map(g => g.user_id))];
      const uncachedIds = userIds.filter(id => !profileCache[id]);
      
      if (uncachedIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', uncachedIds);

      if (data) {
        const newCache = { ...profileCache };
        data.forEach(p => {
          newCache[p.id] = { name: p.name, email: p.email };
        });
        setProfileCache(newCache);
      }
    };

    fetchProfiles();
  }, [grievances]);

  const handleStatusChange = async (grievance: DbGrievance, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ 
        id: grievance.id, 
        status: newStatus as DbGrievance['status'],
        grievance 
      });
      toast({
        title: "Status Updated",
        description: `Grievance status changed to ${newStatus.replace('_', ' ')}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive"
      });
    }
  };

  const handleAssignStaff = async (grievance: DbGrievance, staffId: string) => {
    try {
      await assignGrievance.mutateAsync({ 
        id: grievance.id, 
        assignedTo: staffId === 'unassign' ? null : staffId,
        grievance 
      });
      toast({
        title: staffId === 'unassign' ? "Staff Unassigned" : "Staff Assigned",
        description: staffId === 'unassign' 
          ? "Grievance is now unassigned." 
          : "Staff member has been assigned to this grievance."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign staff.",
        variant: "destructive"
      });
    }
  };

  // Bulk action handlers
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    
    setBulkProcessing(true);
    const selectedGrievances = grievances?.filter(g => selectedIds.has(g.id)) || [];
    
    try {
      await Promise.all(
        selectedGrievances.map(grievance => 
          updateStatus.mutateAsync({ 
            id: grievance.id, 
            status: newStatus as DbGrievance['status'],
            grievance 
          })
        )
      );
      toast({
        title: "Bulk Status Update",
        description: `Updated ${selectedIds.size} grievance(s) to ${newStatus.replace('_', ' ')}.`
      });
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some grievances.",
        variant: "destructive"
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkAssign = async (staffId: string) => {
    if (selectedIds.size === 0) return;
    
    setBulkProcessing(true);
    const selectedGrievances = grievances?.filter(g => selectedIds.has(g.id)) || [];
    
    try {
      await Promise.all(
        selectedGrievances.map(grievance => 
          assignGrievance.mutateAsync({ 
            id: grievance.id, 
            assignedTo: staffId === 'unassign' ? null : staffId,
            grievance 
          })
        )
      );
      const staffMember = staff?.find(s => s.id === staffId);
      toast({
        title: "Bulk Assignment",
        description: staffId === 'unassign' 
          ? `Unassigned ${selectedIds.size} grievance(s).`
          : `Assigned ${selectedIds.size} grievance(s) to ${staffMember?.name || staffMember?.email}.`
      });
      setSelectedIds(new Set());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign some grievances.",
        variant: "destructive"
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleSelectAll = () => {
    if (!filteredGrievances) return;
    
    if (selectedIds.size === filteredGrievances.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGrievances.map(g => g.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredGrievances = grievances?.filter(g => {
    const userName = profileCache[g.user_id]?.name || profileCache[g.user_id]?.email || '';
    return (
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      userName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getStaffName = (staffId: string | null) => {
    if (!staffId || !staff) return "Unassigned";
    const member = staff.find(s => s.id === staffId);
    return member?.name || member?.email || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const allSelected = filteredGrievances && filteredGrievances.length > 0 && selectedIds.size === filteredGrievances.length;
  const someSelected = selectedIds.size > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={!!user}
        userRole={role || undefined}
        userName={profile?.name || undefined}
        onLogout={signOut}
      />
      
      <main className="flex-1 container py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage all grievances, assign staff, and update statuses</p>
          </div>
        </div>

        {/* Search and Bulk Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, title, or ticket ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {someSelected && (
          <div className="flex flex-wrap items-center gap-3 p-4 mb-4 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="font-medium">{selectedIds.size} selected</span>
            </div>
            
            <div className="h-6 w-px bg-border" />
            
            <Select onValueChange={handleBulkStatusChange} disabled={bulkProcessing}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Set Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={handleBulkAssign} disabled={bulkProcessing}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Assign Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassign">Unassigned</SelectItem>
                {staff?.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name || member.email}
                    {member.role === 'admin' && " (Admin)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Grievances Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grievancesLoading || staffLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredGrievances && filteredGrievances.length > 0 ? (
                filteredGrievances.map((grievance) => (
                  <TableRow 
                    key={grievance.id}
                    className={selectedIds.has(grievance.id) ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(grievance.id)}
                        onCheckedChange={() => toggleSelect(grievance.id)}
                        aria-label={`Select ${grievance.title}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {profileCache[grievance.user_id]?.name || 
                       profileCache[grievance.user_id]?.email || 
                       "Loading..."}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{grievance.title}</p>
                        <p className="text-xs text-muted-foreground">{grievance.ticket_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(grievance.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={grievance.status}
                        onValueChange={(value) => handleStatusChange(grievance, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={grievance.assigned_to || "unassign"}
                        onValueChange={(value) => handleAssignStaff(grievance, value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Assign staff" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassign">Unassigned</SelectItem>
                          {staff?.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name || member.email}
                              {member.role === 'admin' && " (Admin)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedGrievance(grievance);
                          setCommentsOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Comments
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No grievances found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <Footer />

      {selectedGrievance && (
        <AdminCommentsDialog
          grievance={selectedGrievance}
          open={commentsOpen}
          onOpenChange={setCommentsOpen}
        />
      )}
    </div>
  );
}
