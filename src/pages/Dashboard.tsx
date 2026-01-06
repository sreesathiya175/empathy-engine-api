import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatCard } from "@/components/dashboard/StatCard";
import { GrievanceCard } from "@/components/grievance/GrievanceCard";
import { GrievanceDetailDialog } from "@/components/grievance/GrievanceDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Filter,
  PlusCircle,
  UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  type Grievance,
  CATEGORIES
} from "@/types/grievance";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useGrievances, useGrievanceStats, useAssignedGrievances, DbGrievance } from "@/hooks/useGrievances";

// Convert DB grievance to frontend type
function toGrievance(dbGrievance: DbGrievance): Grievance {
  return {
    ...dbGrievance,
    assigned_to: dbGrievance.assigned_to || undefined,
    file_url: dbGrievance.file_url || undefined
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, role, isLoading: authLoading, signOut } = useAuth();
  const { data: grievances, isLoading: grievancesLoading } = useGrievances();
  const { data: assignedGrievances, isLoading: assignedLoading } = useAssignedGrievances();
  const { stats, sentimentData, categoryData, isLoading: statsLoading } = useGrievanceStats();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedGrievance, setSelectedGrievance] = useState<DbGrievance | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const isStaff = role === 'employee' || role === 'admin';

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const filterGrievances = (list: DbGrievance[] | undefined) => {
    return (list || []).filter((g) => {
      const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.ticket_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || g.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || g.priority === priorityFilter;
      const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  };

  const filteredGrievances = filterGrievances(grievances);
  const filteredAssigned = filterGrievances(assignedGrievances);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleCardClick = (grievance: DbGrievance) => {
    setSelectedGrievance(grievance);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={true} 
        userName={profile?.name || user?.email || "User"} 
        userRole={role}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 container py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Overview of all grievances and analytics</p>
          </div>
          <Link to="/submit">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Submit Grievance
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          {statsLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                title="Total Grievances"
                value={stats.total}
                icon={FileText}
                variant="primary"
              />
              <StatCard
                title="Pending"
                value={stats.pending}
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="In Progress"
                value={stats.inProgress}
                icon={Loader2}
                variant="default"
              />
              <StatCard
                title="Resolved"
                value={stats.resolved}
                icon={CheckCircle2}
                variant="success"
              />
              <StatCard
                title="High Priority"
                value={stats.highPriority}
                icon={AlertTriangle}
                variant="danger"
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Sentiment Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Sentiment Distribution</h3>
            <div className="h-64">
              {statsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats.total === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sentimentData.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Grievances by Category</h3>
            <div className="h-64">
              {statsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : stats.total === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData.filter(d => d.count > 0)}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(173, 58%, 26%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grievances List with Tabs for Staff */}
        {isStaff ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="gap-2">
                <FileText className="h-4 w-4" />
                All Grievances
              </TabsTrigger>
              <TabsTrigger value="assigned" className="gap-2">
                <UserCheck className="h-4 w-4" />
                Assigned to Me ({assignedGrievances?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {grievancesLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredGrievances.map((grievance) => (
                      <GrievanceCard 
                        key={grievance.id} 
                        grievance={toGrievance(grievance)}
                        onClick={() => handleCardClick(grievance)}
                      />
                    ))}
                  </div>

                  {filteredGrievances.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">No grievances found</h3>
                      <p className="text-muted-foreground">
                        {(grievances?.length || 0) === 0 
                          ? "No grievances submitted yet" 
                          : "Try adjusting your filters or search term"}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="assigned">
              {assignedLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAssigned.map((grievance) => (
                      <GrievanceCard 
                        key={grievance.id} 
                        grievance={toGrievance(grievance)}
                        onClick={() => handleCardClick(grievance)}
                      />
                    ))}
                  </div>

                  {filteredAssigned.length === 0 && (
                    <div className="text-center py-12">
                      <UserCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">No assigned grievances</h3>
                      <p className="text-muted-foreground">
                        Grievances assigned to you will appear here
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          /* Regular user view */
          grievancesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGrievances.map((grievance) => (
                  <GrievanceCard 
                    key={grievance.id} 
                    grievance={toGrievance(grievance)}
                    onClick={() => handleCardClick(grievance)}
                  />
                ))}
              </div>

              {filteredGrievances.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No grievances found</h3>
                  <p className="text-muted-foreground">
                    {(grievances?.length || 0) === 0 
                      ? "Submit your first grievance to get started" 
                      : "Try adjusting your filters or search term"}
                  </p>
                  {(grievances?.length || 0) === 0 && (
                    <Link to="/submit" className="mt-4 inline-block">
                      <Button>Submit Grievance</Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          )
        )}

        {/* Grievance Detail Dialog */}
        {selectedGrievance && (
          <GrievanceDetailDialog 
            grievance={selectedGrievance}
            open={!!selectedGrievance}
            onOpenChange={(open) => !open && setSelectedGrievance(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
