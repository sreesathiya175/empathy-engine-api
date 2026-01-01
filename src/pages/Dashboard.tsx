import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StatCard } from "@/components/dashboard/StatCard";
import { GrievanceCard } from "@/components/grievance/GrievanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Clock, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Filter,
  PlusCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  type Grievance, 
  type GrievanceStatus, 
  type PriorityLevel,
  type SentimentType,
  CATEGORIES,
  type GrievanceCategory
} from "@/types/grievance";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

// Mock data for demonstration
const mockGrievances: Grievance[] = [
  {
    id: "1",
    ticket_id: "GRV-ABC123-XYZ",
    user_id: "user1",
    category: "IT",
    title: "Network connectivity issues in Building A",
    description: "The WiFi has been extremely slow and disconnecting frequently for the past week. This is severely impacting our work productivity.",
    sentiment: "highly_negative",
    priority: "high",
    status: "in_progress",
    assigned_to: "tech_team",
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-16T14:00:00Z"
  },
  {
    id: "2",
    ticket_id: "GRV-DEF456-ABC",
    user_id: "user2",
    category: "HR",
    title: "Request for flexible working hours",
    description: "I would like to request flexible working hours to better manage my work-life balance. I believe this would increase my productivity.",
    sentiment: "neutral",
    priority: "low",
    status: "pending",
    created_at: "2024-01-14T09:15:00Z",
    updated_at: "2024-01-14T09:15:00Z"
  },
  {
    id: "3",
    ticket_id: "GRV-GHI789-DEF",
    user_id: "user3",
    category: "Infrastructure",
    title: "Air conditioning not working in Conference Room 3",
    description: "The AC unit in Conference Room 3 has stopped working. Meetings are becoming uncomfortable. Please fix this issue urgently.",
    sentiment: "negative",
    priority: "medium",
    status: "pending",
    created_at: "2024-01-13T16:45:00Z",
    updated_at: "2024-01-13T16:45:00Z"
  },
  {
    id: "4",
    ticket_id: "GRV-JKL012-GHI",
    user_id: "user4",
    category: "Academic",
    title: "Appreciation for new library resources",
    description: "I am delighted with the new digital resources added to the library. The research databases are extremely helpful for my thesis work.",
    sentiment: "positive",
    priority: "low",
    status: "resolved",
    created_at: "2024-01-12T11:20:00Z",
    updated_at: "2024-01-12T15:30:00Z"
  },
  {
    id: "5",
    ticket_id: "GRV-MNO345-JKL",
    user_id: "user5",
    category: "Finance",
    title: "Delay in reimbursement processing",
    description: "My travel reimbursement submitted 3 weeks ago is still pending. This is causing financial strain. Please expedite the process.",
    sentiment: "negative",
    priority: "medium",
    status: "in_progress",
    assigned_to: "finance_team",
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  }
];

const sentimentData = [
  { name: "Positive", value: 15, color: "hsl(142, 71%, 45%)" },
  { name: "Neutral", value: 25, color: "hsl(200, 15%, 50%)" },
  { name: "Negative", value: 35, color: "hsl(38, 92%, 50%)" },
  { name: "Highly Negative", value: 25, color: "hsl(0, 72%, 51%)" }
];

const categoryData = CATEGORIES.map((cat, index) => ({
  name: cat,
  count: Math.floor(Math.random() * 20) + 5
}));

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredGrievances = mockGrievances.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.ticket_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || g.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || g.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const stats = {
    total: mockGrievances.length,
    pending: mockGrievances.filter(g => g.status === "pending").length,
    inProgress: mockGrievances.filter(g => g.status === "in_progress").length,
    resolved: mockGrievances.filter(g => g.status === "resolved").length,
    highPriority: mockGrievances.filter(g => g.priority === "high").length
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        isAuthenticated={true} 
        userName="John Doe" 
        userRole="admin"
        onLogout={() => {}}
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
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Sentiment Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Sentiment Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Grievances by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(173, 58%, 26%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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

        {/* Grievances List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGrievances.map((grievance) => (
            <GrievanceCard key={grievance.id} grievance={grievance} />
          ))}
        </div>

        {filteredGrievances.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No grievances found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search term</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}