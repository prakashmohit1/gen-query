"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  BarChart,
  Database,
  History,
  LineChart,
  PieChart,
  Plus,
  Settings,
  Users,
  Star,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("recent");

  const recentQueries = [
    {
      query: "SELECT * FROM users WHERE created_at > '2024-01-01'",
      database: "Production DB",
      timestamp: "2 hours ago",
      status: "Completed",
    },
    {
      query: "SELECT COUNT(*) FROM orders GROUP BY status",
      database: "Analytics DB",
      timestamp: "5 hours ago",
      status: "Completed",
    },
    {
      query: "UPDATE user_preferences SET theme = 'dark'",
      database: "User DB",
      timestamp: "1 day ago",
      status: "Completed",
    },
  ];

  const favoriteQueries = [
    {
      query: "SELECT * FROM sales WHERE region = 'North'",
      database: "Sales DB",
      timestamp: "Saved",
      status: "Favorite",
    },
    {
      query: "SELECT customer_name, SUM(order_total) FROM orders",
      database: "Analytics DB",
      timestamp: "Saved",
      status: "Favorite",
    },
  ];

  const popularQueries = [
    {
      query: "SELECT TOP 10 * FROM products ORDER BY views DESC",
      database: "Products DB",
      timestamp: "100+ runs",
      status: "Popular",
    },
    {
      query: "SELECT AVG(response_time) FROM api_logs",
      database: "Metrics DB",
      timestamp: "50+ runs",
      status: "Popular",
    },
  ];

  const newFeatures = [
    {
      query: "New AI-Powered Query Optimization",
      database: "System",
      timestamp: "Just Released",
      status: "New",
    },
    {
      query: "Advanced Query Analytics Dashboard",
      database: "System",
      timestamp: "Coming Soon",
      status: "Beta",
    },
  ];

  const quickActions = [
    {
      title: "New Query",
      icon: Plus,
      href: "/db-editor",
      description: "Create and execute SQL queries",
    },
    {
      title: "Query History",
      icon: History,
      href: "/query-history",
      description: "View and manage past queries",
    },
    {
      title: "Databases",
      icon: Database,
      href: "/computes",
      description: "Manage database connections",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
      description: "Configure your preferences",
    },
  ];

  const stats = [
    {
      title: "Total Queries",
      value: "1,234",
      icon: LineChart,
      trend: "+12.5%",
    },
    {
      title: "Users",
      value: "156",
      icon: Users,
      trend: "+5.2%",
    },
    {
      title: "Database Size",
      value: "2.1 TB",
      icon: Database,
      trend: "+8.1%",
    },
    {
      title: "Query Performance",
      value: "98.5%",
      icon: BarChart,
      trend: "+2.3%",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome to GenQuery</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href}>
              <Card className="hover:bg-accent cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {action.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Tabbed Content */}
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList>
              <TabsTrigger value="recent">
                <History className="h-4 w-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="favorite">
                <Star className="h-4 w-4 mr-2" />
                Favorite
              </TabsTrigger>
              <TabsTrigger value="popular">
                <TrendingUp className="h-4 w-4 mr-2" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="new">
                <Sparkles className="h-4 w-4 mr-2" />
                What's New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {query.query}
                      </TableCell>
                      <TableCell>{query.database}</TableCell>
                      <TableCell>{query.timestamp}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {query.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="favorite">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favoriteQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {query.query}
                      </TableCell>
                      <TableCell>{query.database}</TableCell>
                      <TableCell>{query.timestamp}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {query.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="popular">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Database</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularQueries.map((query, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {query.query}
                      </TableCell>
                      <TableCell>{query.database}</TableCell>
                      <TableCell>{query.timestamp}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {query.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="new">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Release</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newFeatures.map((feature, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {feature.query}
                      </TableCell>
                      <TableCell>{feature.database}</TableCell>
                      <TableCell>{feature.timestamp}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {feature.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
