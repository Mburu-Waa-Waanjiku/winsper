// app/blog/page.jsx
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import BlogCard from "@/components/ui/BlogCard";
import BlogFilter from "@/components/BlogFilter";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { PrismaClient } from '@prisma/client';
import MotionWrapper from "@/components/MotionWrapper";

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Fallback data in case database query fails
const fallbackData = {
  blogPosts: [],
  categories: [],
  tags: [],
  pagination: { total: 0, limit: 50, offset: 0, hasMore: false },
  metaTitle: "Blog - Winsper Lands",
  metaDescription: "Get the latest insights and trends & information on Real Estate Investments from Winsper Lands. Stay updated with our expert analysis and market updates."
};

// Server-side data fetching function
async function getBlogData(searchParams = {}) {
  const category = searchParams.category || 'all';
  const limit = 50;
  const offset = 0;
  
  try {
    // Build where clause for filtering by category
    const whereClause = {
      status: 'PUBLISHED',
      isActive: true,
      ...(category !== 'all' && {
        categories: {
          some: {
            slug: category
          }
        }
      })
    };

    // Fetch blog posts with related data
    const [blogPosts, categories, tags, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarBase64: true,
              avatarMimeType: true
            }
          },
          categories: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          },
          tags: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: limit,
        skip: offset
      }),

      // Fetch all active categories
      prisma.blogCategory.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          name: 'asc'
        }
      }),

      // Fetch all tags
      prisma.blogTag.findMany({
        orderBy: {
          name: 'asc'
        }
      }),

      // Get total count for pagination
      prisma.blogPost.count({
        where: whereClause
      })
    ]);

    const transformedData = {
      blogPosts,
      categories,
      tags,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: totalCount > (offset + limit)
      },
      metaTitle: "Blog - Winsper Lands | Real Estate Investment Insights",
      metaDescription: "Get the latest insights and trends & information on Real Estate Investments from Winsper Lands. Stay updated with our expert analysis and market updates."
    };

    return transformedData;
  } catch (error) {
    console.error('Database query failed:', error);
    return fallbackData;
  } finally {
    // Disconnect Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Enhanced metadata generation with comprehensive SEO
export async function generateMetadata({ searchParams }) {
  const category = searchParams?.category || 'all';
  
  try {
    const [blogData, categoryInfo] = await Promise.all([
      getBlogData(searchParams),
      category !== 'all' ? prisma.blogCategory.findFirst({
        where: { slug: category, isActive: true }
      }) : null
    ]);

    await prisma.$disconnect();

    let metaTitle = "Blog - Winsper Investments | Real Estate Investment Insights";
    let metaDescription = "Get the latest insights and trends & information on Real Estate Investments from Winsper Lands. Stay updated with our expert analysis and market updates.";

    // Customize metadata for category pages
    if (categoryInfo) {
      metaTitle = `${categoryInfo.name} - Blog | Winsper Investments`;
      metaDescription = `Explore ${categoryInfo.name.toLowerCase()} articles and insights on real estate investment from Winsper Lands. ${categoryInfo.description || ''}`.trim();
    }

    // Use first blog post image for Open Graph if available
    let ogImage = null;
    if (blogData.blogPosts?.length > 0 && blogData.blogPosts[0].featuredImageBase64) {
      const firstPost = blogData.blogPosts[0];
      ogImage = {
        url: `data:${firstPost.featuredImageMimeType};base64,${firstPost.featuredImageBase64}`,
        width: firstPost.featuredImageWidth || 1200,
        height: firstPost.featuredImageHeight || 630,
        alt: firstPost.featuredImageAlt || firstPost.title,
      };
    }

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        'real estate blog',
        'property investment insights',
        'Kenya real estate news',
        'Nairobi property updates',
        'land investment tips',
        'Winsper Lands blog',
        'real estate market analysis',
        'property investment advice',
        'real estate trends Kenya',
        'property development updates'
      ],
      authors: [{ name: 'Winsper Investments' }],
      creator: 'Winsper Investments',
      publisher: 'Winsper Investments',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.co.ke'}/blog${category !== 'all' ? `?category=${category}` : ''}`,
        title: metaTitle,
        description: metaDescription,
        siteName: 'Winsper Investments',
        ...(ogImage && { images: [ogImage] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        creator: '@winsperinvestments',
        ...(ogImage && { images: [ogImage.url] }),
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
        yahoo: process.env.YAHOO_SITE_VERIFICATION,
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.co.ke'}/blog${category !== 'all' ? `?category=${category}` : ''}`,
      },
      category: 'Real Estate Blog',
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: "Blog - Winsper Investments | Real Estate Investment Insights",
      description: "Get the latest insights and trends & information on Real Estate Investments from Winsper Lands. Stay updated with our expert analysis and market updates.",
      keywords: [
        'real estate blog',
        'property investment insights',
        'Kenya real estate news',
        'Winsper Investments blog'
      ],
    };
  }
}

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
    month: 'long',
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

// Featured blog posts component
function FeaturedBlogs({ posts }) {
  const featuredPosts = posts.slice(0, 2); // Get first 2 posts as featured

  if (featuredPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No featured posts available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {featuredPosts.map((post) => (
        <MotionWrapper
          effect="scaleUp"
          delay={0.8} 
          duration={0.4}
          key={post.id}
        >
          <Link  href={`${post.slug}`}>
            <Card className="overflow-hidden relative h-[370px] sm:h-80 rounded-3xl group cursor-pointer">
              {post.featuredImageBase64 ? (
                <Image
                  src={`data:${post.featuredImageMimeType};base64,${post.featuredImageBase64}`}
                  alt={post.featuredImageAlt || post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/30" />
              )}
              <CardContent className="py-4 px-8 h-full flex flex-col justify-end text-white relative z-10">
                <h3 className="text-lg sm:text-xl font-semibold mb-5">
                  {post.title}
                </h3>
                <p className="text-sm text-white text-muted-foreground mb-3 line-clamp-2">
                  {post.excerpt || post.content.substring(0, 150) + '...'}
                </p>
                <div className="text-xs flex items-center gap-4 text-white mb-4 text-muted-foreground">
                  <Avatar className="w-8 h-8">
                    {post.author?.avatarBase64 ? (
                      <AvatarImage 
                        src={`data:${post.author.avatarMimeType};base64,${post.author.avatarBase64}`} 
                        alt={post.author.name || 'Author'} 
                      />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {getAuthorInitials(post.author?.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>
                    {post.author?.name || 'Unknown Author'} • {formatDate(post.publishedAt || post.createdAt)}
                  </span>
                </div>
              </CardContent>
              <div className="absolute z-5 top-0 h-full w-full bg-gradient-to-b from-transparent via-black/30 to-black/80"></div>
            </Card>
          </Link>
        </MotionWrapper>
      ))}
    </div>
  );
}

// Main Blog component (Server Component)
export default async function Blog({ searchParams }) {
  const blogData = await getBlogData(searchParams);
  const { blogPosts, categories } = blogData;

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Winsper Lands Blog",
    "description": "Real Estate Investment Insights and Market Analysis",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": "Winsper Lands",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/blog`
    }
  };

  // Generate BlogPosting structured data for featured posts
  const blogPostingsStructuredData = blogPosts.slice(0, 5).map(post => ({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt || post.content.substring(0, 160),
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/blogs/${post.slug}`,
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Winsper Lands Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Winsper Lands"
    },
    ...(post.featuredImageBase64 && {
      "image": `data:${post.featuredImageMimeType};base64,${post.featuredImageBase64}`
    })
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      {blogPostingsStructuredData.map((postData, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(postData),
          }}
        />
      ))}

      <section className="bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/30 pt-4 text-white">
        <Header />
        <div className="max-w-4xl pt-10 pb-8 mx-auto text-center">
          <h1 className="text-4xl md:text-5xl flex flex-col items-center justify-center font-semibold mb-6">
            <>
              <MotionWrapper
                effect="bounceIn"
                delay={0.4} 
                duration={0.8}
              >
                <span className="text-secondary">
                  Stay Updated On
                </span>
              </MotionWrapper>
              <MotionWrapper
                effect="rotateIn"
                delay={0.6} 
                duration={0.4}
              >
                <span className="text-primary">
                  The Latest In Winsper Lands
                </span>
              </MotionWrapper>
            </>
            <MotionWrapper
              effect="elasticIn"
              delay={2} 
              duration={0.8}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-[10deg] -mt-2.5 -ml-8" viewBox="0 0 200 30" width="150" height="30">
                <path d="M10 25 Q20 2 190 25" 
                  stroke="rgb(220 38 38)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                  fill="none"/>
              </svg>
            </MotionWrapper>
          </h1>
          <MotionWrapper
            effect="slideIn"
            direction="up"
            delay={0.4} 
            duration={0.4}
          >
            <p className="text-xl text-secondary px-4 mb-8 mx-6 max-w-2xl mx-auto">
              Get the latest insights and trends & information on Real Estate Investments, all in one place
            </p>
          </MotionWrapper>
        </div>
        <div className="pb-32 bg-gradient-to-b from-transparent via-white/50 to-gray-50"></div>
      </section>

      {/* Featured Posts Section */}
      <section className="py-6 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <FeaturedBlogs posts={blogPosts} />
        </div>
      </section>

      {/* All Articles Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              All Articles
            </h2>
            
            {/* Category Filter - Client Component */}
            <BlogFilter categories={categories} />
          </div>
          
          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <MotionWrapper
                  effect="slideIn"
                  direction="up"
                  delay={0.8} 
                  duration={0.8}
                  key={post.id}
                >
                  <BlogCard
                    id={post.id}
                    title={post.title}
                    excerpt={post.excerpt || post.content.substring(0, 150) + '...'}
                    publishedAt={post.publishedAt || post.createdAt}
                    slug={post.slug}
                    featuredImageBase64={post.featuredImageBase64}
                    featuredImageMimeType={post.featuredImageMimeType}
                    featuredImageAlt={post.featuredImageAlt || post.title}
                    categories={post.categories}
                    author={post.author}
                  />
                </MotionWrapper>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No blog posts found.</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new content!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="p-4">
        <Card className="bg-gradient-to-br from-primary/50 via-secondary/50 to-primary/50 rounded-2xl text-white group cursor-pointer">
          <CardContent className="p-6">
            <MotionWrapper
              effect="slideIn"
              direction="up"
              delay={0.4} 
              duration={0.4}
            >
              <div className="flex w-full justify-center">
                <Badge className="bg-white/10 border border-gray-200 text-white mb-4">Learn More About Us</Badge>
              </div>
            </MotionWrapper>
            <MotionWrapper
              effect="slideIn"
              direction="up"
              delay={0.8} 
              duration={0.4}
            >
              <h3 className="text-4xl font-semibold text-center mb-4">
                Ready To Invest With Us?
              </h3>
            </MotionWrapper>
            <MotionWrapper
              effect="slideIn"
              direction="up"
              delay={1.2} 
              duration={0.4}
            >
              <p className="text-purple-100 text-center mb-4">
                Discover the projects we have on offer & start your investment journey.
              </p>
            </MotionWrapper>
            <div className="flex w-full justify-center">
              <MotionWrapper
                effect="scaleUp"
                delay={1.6} 
                duration={0.4}
              >
                <button className="bg-white text-secondary px-6 pt-1.5 pb-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors">
                  View Projects
                </button>
              </MotionWrapper>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <Footer />
    </div>
  );
}