// components/BlogFilter.jsx
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function BlogFilter({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const handleCategoryChange = (categorySlug) => {
    const params = new URLSearchParams(searchParams);
    
    if (categorySlug === 'all') {
      params.delete('category');
    } else {
      params.set('category', categorySlug);
    }
    
    // Navigate to the new URL
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/blog${newUrl}`);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <Button
        variant={activeCategory === "all" ? "default" : "outline"}
        onClick={() => handleCategoryChange("all")}
        className="rounded-full"
      >
        All Articles
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.slug ? "default" : "outline"}
          onClick={() => handleCategoryChange(category.slug)}
          className="rounded-full"
        >
          {category.name}
          {category._count?.posts > 0 && (
            <span className="ml-1 text-xs opacity-70">
              ({category._count.posts})
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}