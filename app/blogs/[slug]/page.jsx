import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageSlider from '@/components/ImageSlider';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User, Tag, Eye, Share2, Heart, ChevronRight, Clock } from "lucide-react";
import MotionWrapper from '@/components/MotionWrapper';

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Server component to fetch blog post data
async function getBlogPostData(slug) {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: {
        slug: slug,
        isActive: true,
        status: 'PUBLISHED',
      },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        sections: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        categories: {
          where: { isActive: true }
        },
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarBase64: true,
            avatarMimeType: true,
          }
        }
      }
    });

    return blogPost;
  } catch (error) {
    console.error('Error fetching blog post data:', error);
    return null;
  } finally {
    // Disconnect Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Fetch related blog posts
async function getRelatedPosts(currentPostId, categories, limit = 4) {
  try {
    const categoryIds = categories.map(cat => cat.id);
    
    // First try to get posts from same categories
    const relatedPosts = await prisma.blogPost.findMany({
      where: {
        id: { not: currentPostId },
        isActive: true,
        status: 'PUBLISHED',
        categories: {
          some: {
            id: { in: categoryIds }
          }
        }
      },
      include: {
        author: {
          select: {
            name: true,
            avatarBase64: true,
            avatarMimeType: true,
          }
        },
        categories: {
          where: { isActive: true },
          take: 2
        }
      },
      orderBy: [
        { publishedAt: 'desc' }
      ],
      take: limit
    });

    // If we don't have enough related posts, get recent ones
    if (relatedPosts.length < limit) {
      const additionalPosts = await prisma.blogPost.findMany({
        where: {
          id: { 
            not: currentPostId,
            notIn: relatedPosts.map(p => p.id)
          },
          isActive: true,
          status: 'PUBLISHED'
        },
        include: {
          author: {
            select: {
              name: true,
              avatarBase64: true,
              avatarMimeType: true,
            }
          },
          categories: {
            where: { isActive: true },
            take: 2
          }
        },
        orderBy: [
          { publishedAt: 'desc' }
        ],
        take: limit - relatedPosts.length
      });

      return [...relatedPosts, ...additionalPosts];
    }

    return relatedPosts;
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// Enhanced metadata generation with comprehensive SEO
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: {
        slug: slug,
        isActive: true,
        status: 'PUBLISHED',
      },
      select: {
        title: true,
        excerpt: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
        featuredImageBase64: true,
        featuredImageMimeType: true,
        featuredImageAlt: true,
        featuredImageWidth: true,
        featuredImageHeight: true,
        categories: {
          where: { isActive: true },
          select: { name: true }
        },
        tags: {
          select: { name: true }
        },
        author: {
          select: {
            name: true
          }
        }
      }
    });

    await prisma.$disconnect();

    if (!blogPost) {
      return {
        title: 'Blog Post Not Found - Winsper Lands',
        description: 'The requested blog post could not be found.',
      };
    }

    const metaTitle = blogPost.metaTitle || `${blogPost.title} | Winsper Lands Blog`;
    const metaDescription = blogPost.metaDescription || blogPost.excerpt || blogPost.content?.substring(0, 160) || `Read ${blogPost.title} on Winsper Lands blog`;
    
    // Create Open Graph image from featured image if available
    let ogImage = null;
    if (blogPost.featuredImageBase64 && blogPost.featuredImageMimeType) {
      ogImage = {
        url: `data:${blogPost.featuredImageMimeType};base64,${blogPost.featuredImageBase64}`,
        width: blogPost.featuredImageWidth || 1200,
        height: blogPost.featuredImageHeight || 630,
        alt: blogPost.featuredImageAlt || blogPost.title,
      };
    }

    const keywords = [
      'Winsper Lands blog',
      'real estate blog',
      'property investment',
      'Kenya real estate',
      ...blogPost.categories.map(cat => cat.name),
      ...blogPost.tags.map(tag => tag.name),
      'land investment tips',
      'property market Kenya'
    ];

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: keywords,
      authors: [{ name: blogPost.author.name || 'Winsper Lands' }],
      creator: blogPost.author.name || 'Winsper Lands',
      publisher: 'Winsper Lands',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/blog/${slug}`,
        title: metaTitle,
        description: metaDescription,
        siteName: 'Winsper Lands',
        publishedTime: blogPost.publishedAt?.toISOString(),
        authors: [blogPost.author.name || 'Winsper Lands'],
        section: blogPost.categories[0]?.name || 'Blog',
        tags: blogPost.tags.map(tag => tag.name),
        ...(ogImage && { images: [ogImage] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        creator: '@winsperlands',
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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/blog/${slug}`,
      },
      category: 'Blog',
      other: {
        'article:author': blogPost.author.name || 'Winsper Lands',
        'article:published_time': blogPost.publishedAt?.toISOString(),
        'article:section': blogPost.categories[0]?.name || 'Blog',
        'article:tag': blogPost.tags.map(tag => tag.name).join(', '),
      }
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Blog Post - Winsper Lands',
      description: 'Read the latest insights and updates from Winsper Lands blog.',
      keywords: [
        'real estate blog',
        'Kenya property market',
        'land investment',
        'property insights'
      ],
    };
  }
}

// Helper function to create image src from base64
function createImageSrc(base64Data, mimeType) {
  if (!base64Data || !mimeType) return null;
  if (base64Data.startsWith('data:')) return base64Data;
  return `data:${mimeType};base64,${base64Data}`;
}

// Helper function to format date
function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Helper function to estimate reading time
function estimateReadingTime(content, sections = []) {
  const wordsPerMinute = 200;
  const contentWordCount = content ? content.split(' ').length : 0;
  const sectionsWordCount = sections.reduce((total, section) => {
    return total + (section.content ? section.content.split(' ').length : 0);
  }, 0);
  const totalWords = contentWordCount + sectionsWordCount;
  const readingTime = Math.ceil(totalWords / wordsPerMinute);
  return readingTime;
}

export default async function BlogPostPage({ params }) {
  const { slug } = params;
  const blogPost = await getBlogPostData(slug);

  if (!blogPost) {
    notFound();
  }

  // Get related posts
  const relatedPosts = await getRelatedPosts(blogPost.id, blogPost.categories);

  const readingTime = estimateReadingTime(blogPost.content, blogPost.sections);
  const featuredImageSrc = createImageSrc(blogPost.featuredImageBase64, blogPost.featuredImageMimeType);

  // Generate structured data for the blog post
  const blogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/blog/${slug}#blogpost`,
    "headline": blogPost.title,
    "description": blogPost.excerpt || blogPost.content?.substring(0, 160),
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/blog/${slug}`,
    "datePublished": blogPost.publishedAt?.toISOString(),
    "dateModified": blogPost.updatedAt?.toISOString(),
    "author": {
      "@type": "Person",
      "name": blogPost.author.name || "Winsper Investments",
      "email": blogPost.author.email
    },
    "publisher": {
      "@type": "Organization",
      "name": "Winsper Investments",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/blog/${slug}`
    },
    "articleSection": blogPost.categories[0]?.name || "Blog",
    "keywords": blogPost.tags.map(tag => tag.name).join(", "),
    ...(featuredImageSrc && {
      "image": {
        "@type": "ImageObject",
        "url": featuredImageSrc,
        "width": blogPost.featuredImageWidth || 1200,
        "height": blogPost.featuredImageHeight || 630
      }
    })
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blogPost.categories[0]?.name || "Post",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/blog?category=${encodeURIComponent(blogPost.categories[0]?.slug || '')}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": blogPost.title,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/blog/${slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      {/* Animated Header */}
      <MotionWrapper
        effect="slideIn" 
        direction="right" 
        delay={0.2}
        className="relative z-[4]"
      >
        <Header />
      </MotionWrapper>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          {/* Breadcrumb */}
          <nav
            className="flex items-center space-x-2 text-sm text-muted-foreground mb-6 max-w-full overflow-hidden"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <a
              href="/"
              className="hover:text-foreground shrink-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name">Home</span>
              <meta itemProp="position" content="1" />
            </a>
            <ChevronRight className="h-4 min-w-4 shrink-0" />
            
            <a
              href="/blogs"
              className="hover:text-foreground shrink-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name">Blog</span>
              <meta itemProp="position" content="2" />
            </a>
            <ChevronRight className="h-4 min-w-4 shrink-0" />
            
            {blogPost.categories[0] && (
              <>
                <a
                  href={`/blogs`}
                  className="hover:text-foreground shrink-0"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <span itemProp="name">{blogPost.categories[0].name}</span>
                  <meta itemProp="position" content="3" />
                </a>
                <ChevronRight className="h-4 min-w-4 shrink-0" />
              </>
            )}
            
            <span
              className="text-foreground flex-1 min-w-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span
                itemProp="name"
                className="truncate block"
              >
                {blogPost.title}
              </span>
              <meta itemProp="position" content="4" />
            </span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Blog Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Article Header */}
              <MotionWrapper 
                effect="slideIn" 
                direction="up" 
                delay={0.2}
                className="relative z-[4]"
              >
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* Categories */}
                    {blogPost.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blogPost.categories.map((category) => (
                          <Badge 
                            key={category.id} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                      {blogPost.title}
                    </h1>
                    {/* Featured Image */}
                    {featuredImageSrc && (
                      <MotionWrapper 
                        effect="slideIn" 
                        direction="up" 
                        delay={0.4}
                        className="relative z-[4]"
                      >
                        <div className="relative rounded-3xl overflow-hidden aspect-video">
                          <img 
                            src={featuredImageSrc}
                            alt={blogPost.featuredImageAlt || blogPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </MotionWrapper>
                    )}

                    {/* Excerpt */}
                    {blogPost.excerpt && (
                      <p className="text-xl text-muted-foreground leading-relaxed">
                        {blogPost.excerpt}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{blogPost.author.name || 'Winsper Lands'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <time dateTime={blogPost.publishedAt?.toISOString()}>
                          {formatDate(blogPost.publishedAt)}
                        </time>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{readingTime} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionWrapper>

              {/* Blog Images Slider */}
              {blogPost.images && blogPost.images.length > 0 && (
                <MotionWrapper 
                  effect="slideIn" 
                  direction="up" 
                  delay={0.5}
                  className="relative z-[4]"
                >
                  <ImageSlider images={blogPost.images} />
                </MotionWrapper>
              )}

              {/* Main Content */}
              <MotionWrapper 
                effect="slideIn" 
                direction="up" 
                delay={0.6}
                className="relative z-[4]"
              >
                <Card className="rounded-3xl">
                  <CardContent className="p-8">
                    <div className="prose max-w-none">
                      <div 
                        className="text-muted-foreground leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: blogPost.content.replace(/\n/g, '<br />') }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </MotionWrapper>

              {/* Blog Sections */}
              {blogPost.sections && blogPost.sections.length > 0 && (
                <div className="space-y-8">
                  {blogPost.sections.map((section, index) => {
                    const sectionImageSrc = createImageSrc(section.imageBase64, section.imageMimeType);
                    
                    return (
                      <MotionWrapper 
                        key={section.id}
                        effect="slideIn" 
                        direction="up" 
                        delay={0.7 + (index * 0.1)}
                        className="relative z-[4]"
                      >
                        <Card className="rounded-3xl">
                          <CardContent className="p-8">
                            <div className="space-y-6">
                              <h2 className="text-2xl font-bold">
                                {section.title}
                              </h2>
                              
                              {sectionImageSrc && (
                                <div className="relative rounded-2xl overflow-hidden aspect-video">
                                  <img 
                                    src={sectionImageSrc}
                                    alt={section.imageAlt || section.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              <div className="prose max-w-none">
                                <div 
                                  className="text-muted-foreground leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </MotionWrapper>
                    );
                  })}
                </div>
              )}

              {/* Tags */}
              {blogPost.tags.length > 0 && (
                <MotionWrapper 
                  effect="slideIn" 
                  direction="up" 
                  delay={0.8}
                  className="relative z-[4]"
                >
                  <Card className="rounded-3xl">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {blogPost.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              #{tag.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </MotionWrapper>
              )}
            </div>

            {/* Sidebar */}
            <MotionWrapper 
              effect="slideIn" 
              direction="up" 
              delay={0.8}
              className="relative z-[4]"
            >
              <div className="lg:col-span-1 space-y-6">
                {/* Author Card */}
                <Card className="rounded-3xl sticky top-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">About the Author</h3>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" title="Share Post">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Save Post">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={createImageSrc(blogPost.author.avatarBase64, blogPost.author.avatarMimeType) || "/Winsper-Lands-Investments-Limited-logo.png"} 
                          alt={blogPost.author.name || 'Author'}
                        />
                        <AvatarFallback>
                          {(blogPost.author.name || 'A').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {blogPost.author.name || 'Winsper Lands'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Real Estate Expert
                        </div>
                      </div>
                    </div>

                    <Button className="w-full rounded-full bg-primary text-white hover:bg-primary/90">
                      Follow Author
                    </Button>
                  </CardContent>
                </Card>

                {/* Article Stats */}
                <Card className="rounded-3xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Article Info</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Published</span>
                          <span>{formatDate(blogPost.publishedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Reading time</span>
                          <span>{readingTime} minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Category</span>
                          <span>{blogPost.categories[0]?.name || 'General'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </MotionWrapper>
          </div>
        </div>
      </main>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-white p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Related Articles</h3>
              <Button variant="outline" className="flex border-2 items-center rounded-full px-6 border-gray-300 gap-1" size="sm">
                View All
                <ChevronRight className="w-2 h-2 mt-1"/>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPosts.map((post, index) => {
                const authorImageSrc = createImageSrc(post.author.avatarBase64, post.author.avatarMimeType);
                
                return (
                  <MotionWrapper 
                    key={post.id}
                    effect="slideIn" 
                    direction="left" 
                    delay={0.8 + (index * 0.1)}
                    className="relative z-[4]"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="aspect-video bg-muted relative">
                        {createImageSrc(post.featuredImageBase64, post.featuredImageMimeType) ? (
                          <img 
                            src={createImageSrc(post.featuredImageBase64, post.featuredImageMimeType)} 
                            alt={post.featuredImageAlt || post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="space-y-3 flex-1">
                          {post.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {post.categories.slice(0, 2).map((category) => (
                                <Badge key={category.id} variant="secondary" className="text-xs">
                                  {category.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <h4 className="font-semibold line-clamp-2 flex-1">
                            {post.title}
                          </h4>
                          
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={authorImageSrc || "/Winsper-Lands-Investments-Limited-logo.png"} />
                              <AvatarFallback>
                                {(post.author.name || 'A').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{post.author.name || 'Winsper Lands'}</span>
                            <span>•</span>
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          
                          <Button variant="outline" className="w-full mt-2" asChild>
                            <a href={`/blog/${post.slug}`}>Read More</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </MotionWrapper>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}