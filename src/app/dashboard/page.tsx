"use client"

import { useTranslation } from "@/hooks/useTranslation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  MapPin,
  Clock,
  DollarSign
} from "lucide-react"

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("navigation.dashboard")}
              </h1>
              <p className="text-muted-foreground">
                Welcome back! Here&apos;s what&apos;s happening with your job applications.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("navigation.jobs")}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("navigation.applications")}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("navigation.interviews")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 scheduled this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profile Views
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +23 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Your latest job applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "1",
                    jobTitle: "Senior Frontend Developer",
                    company: "TechCorp Inc.",
                    status: "screening" as const,
                    appliedDate: "2024-01-15",
                    location: "Remote",
                    salary: "$80k - $120k"
                  },
                  {
                    id: "2",
                    jobTitle: "Full Stack Engineer",
                    company: "StartupXYZ",
                    status: "pending" as const,
                    appliedDate: "2024-01-14",
                    location: "New York, NY",
                    salary: "$90k - $130k"
                  },
                  {
                    id: "3",
                    jobTitle: "React Developer",
                    company: "Digital Solutions",
                    status: "interview" as const,
                    appliedDate: "2024-01-13",
                    location: "San Francisco, CA",
                    salary: "$85k - $115k"
                  }
                ].map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{application.jobTitle}</h4>
                      <p className="text-sm text-muted-foreground">{application.company}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {application.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {application.salary}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {application.appliedDate}
                        </span>
                      </div>
                    </div>
                    <Badge variant={
                      application.status === "interview" ? "success" :
                      application.status === "screening" ? "warning" :
                      "default"
                    }>
                      {t(`application.status.${application.status}`)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Jobs</CardTitle>
              <CardDescription>
                Jobs that match your skills and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "1",
                    jobTitle: "Senior React Developer",
                    company: "Innovation Labs",
                    location: "Remote",
                    type: "full_time" as const,
                    experience: "senior" as const,
                    salary: "$100k - $140k",
                    matchScore: 95
                  },
                  {
                    id: "2",
                    jobTitle: "Frontend Team Lead",
                    company: "Growth Tech",
                    location: "Austin, TX",
                    type: "full_time" as const,
                    experience: "lead" as const,
                    salary: "$110k - $150k",
                    matchScore: 88
                  },
                  {
                    id: "3",
                    jobTitle: "UI/UX Developer",
                    company: "Creative Agency",
                    location: "Los Angeles, CA",
                    type: "contract" as const,
                    experience: "mid" as const,
                    salary: "$70k - $90k",
                    matchScore: 82
                  }
                ].map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{job.jobTitle}</h4>
                      <Badge variant="outline" className="text-xs">
                        {job.matchScore}% Match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{job.company}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span>{t(`employmentType.${job.type}`)}</span>
                      <span>{t(`experience.${job.experience}`)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{job.salary}</span>
                      <Button size="sm">Apply Now</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex flex-col items-center justify-center gap-2">
                <Briefcase className="h-6 w-6" />
                <span>Search Jobs</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Update Resume</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                <span>Network</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
