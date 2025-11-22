'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const managementSections = [
    {
      title: 'Categories',
      description: 'Manage product categories',
      href: '/admin/categories',
      icon: '📁',
      color: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'SubCategories',
      description: 'Manage product subcategories',
      href: '/admin/subcategories',
      icon: '📂',
      color: 'bg-green-50 hover:bg-green-100',
    },
    {
      title: 'Products',
      description: 'Manage products inventory',
      href: '/admin/products',
      icon: '📦',
      color: 'bg-purple-50 hover:bg-purple-100',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the admin dashboard. Manage your store from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className={`h-full transition-colors cursor-pointer ${section.color}`}>
              <CardHeader>
                <div className="text-4xl mb-2">{section.icon}</div>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
                <CardDescription className="text-base">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Manage {section.title}
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/categories">
                <Button variant="outline" className="w-full">
                  Add New Category
                </Button>
              </Link>
              <Link href="/admin/subcategories">
                <Button variant="outline" className="w-full">
                  Add New SubCategory
                </Button>
              </Link>
              <Link href="/admin/products">
                <Button variant="outline" className="w-full">
                  Add New Product
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Create categories to organize your products</li>
              <li>✅ Add subcategories for better product classification</li>
              <li>✅ Add products with detailed information and images</li>
              <li>✅ Toggle featured products for homepage display</li>
              <li>✅ Manage stock levels and pricing</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;