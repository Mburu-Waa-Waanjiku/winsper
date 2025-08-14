// components/ui/BlogCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'No date';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Helper function to get author initials
function getAuthorInitials(name) {
  if (!name) return 'AU';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function BlogCard({
  id,
  title,
  excerpt,
  publishedAt,
  slug,
  featuredImageBase64,
  featuredImageMimeType,
  featuredImageAlt,
  categories = [],
  author
}) {
  const primaryCategory = categories[0]; // Get the first category as primary

  return (
    <Link href={`/blogs/${slug}`} className="block">
      <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
        {/* Featured Image */}
        <div className="relative h-48 overflow-hidden">
          {featuredImageBase64 ? (
            <Image
              src={`data:${featuredImageMimeType};base64,${featuredImageBase64}`}
              alt={featuredImageAlt || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/20 flex items-center justify-center">
              <div className="text-gray-400 text-sm">No Image</div>
            </div>
          )}
          
          {/* Category Badge */}
          {primaryCategory && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium"
                style={{ 
                  backgroundColor: primaryCategory.color || '#gray', 
                  color: 'white' 
                }}
              >
                {primaryCategory.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Card Content */}
        <CardContent className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
          <div>
            {/* Title */}
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            {/* Excerpt */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {excerpt}
            </p>
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                {author?.avatarBase64 ? (
                  <AvatarImage 
                    src={`data:${author.avatarMimeType};base64,${author.avatarBase64}`} 
                    alt={author.name || 'Author'} 
                  />
                ) : (
                  <AvatarFallback className="text-xs">
                    {getAuthorInitials(author?.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-xs font-medium text-gray-700">
                {author?.name || 'Unknown'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(publishedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}