import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Calendar, 
  User, 
  Building, 
  ChevronRight, 
  Share2,
  Heart
} from "lucide-react";
import { TitleIssuingGallery } from '@/components/Gallery';
import Image from 'next/image';
import MotionWrapper from '@/components/MotionWrapper';

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Server component to fetch title issuing data
async function getTitleIssuingData(slug) {
  try {
    const titleIssuing = await prisma.titleIssuing.findFirst({
      where: {
        id: slug, // Assuming slug is the ID, adjust if you have a separate slug field
        isActive: true,
      },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
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

    return titleIssuing;
  } catch (error) {
    console.error('Error fetching title issuing data:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

// Fetch related title issuing events
async function getRelatedTitleIssuing(currentId, limit = 6) {
  try {
    const relatedEvents = await prisma.titleIssuing.findMany({
      where: {
        id: { not: currentId },
        isActive: true,
      },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          take: 1
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return relatedEvents;
  } catch (error) {
    console.error('Error fetching related title issuing events:', error);
    return [];
  }
}

// Enhanced metadata generation
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const titleIssuing = await prisma.titleIssuing.findFirst({
      where: {
        id: slug,
        isActive: true,
      },
      select: {
        title: true,
        description: true,
        clientName: true,
        projectName: true,
        location: true,
        status: true,
        issueDate: true,
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          take: 1,
          select: {
            base64Data: true,
            mimeType: true,
            alt: true,
            width: true,
            height: true
          }
        }
      }
    });

    await prisma.$disconnect();

    if (!titleIssuing) {
      return {
        title: 'Title Issuing Event Not Found - Winsper Lands',
        description: 'The requested title issuing event could not be found.',
      };
    }

    const metaTitle = `${titleIssuing.title} - Title Issuing | Winsper Lands`;
    const metaDescription = titleIssuing.description?.substring(0, 160) || `Title issuing event for ${titleIssuing.clientName || 'client'} - ${titleIssuing.projectName || titleIssuing.location}`;
    
    // Create Open Graph image from event image if available
    let ogImage = null;
    if (titleIssuing.images?.[0]) {
      const eventImage = titleIssuing.images[0];
      ogImage = {
        url: `data:${eventImage.mimeType};base64,${eventImage.base64Data}`,
        width: eventImage.width || 1200,
        height: eventImage.height || 630,
        alt: eventImage.alt || titleIssuing.title,
      };
    }

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        'title issuing',
        'property title',
        'land title',
        'Kenya property services',
        'real estate documentation',
        'Winsper Lands',
        titleIssuing.location,
        titleIssuing.projectName,
        'property registration'
      ],
      authors: [{ name: 'Winsper Lands' }],
      creator: 'Winsper Lands',
      publisher: 'Winsper Lands',
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/title-issuing/${slug}`,
        title: metaTitle,
        description: metaDescription,
        siteName: 'Winsper Lands',
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
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/title-issuing/${slug}`,
      },
      category: 'Title Issuing Services',
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Title Issuing Event - Winsper Lands',
      description: 'View title issuing event details and documentation services with Winsper Lands.',
    };
  }
}

// Format status badge
function getStatusBadge(status) {
  const statusConfig = {
    PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  };
  
  return statusConfig[status] || statusConfig.PENDING;
}


// Helper function to create image src from base64
function createImageSrc(base64Data, mimeType) {
    if (!base64Data || !mimeType) return null;
    if (base64Data.startsWith('data:')) return base64Data;
    return `data:${mimeType};base64,${base64Data}`;
  }

export default async function TitleIssuingEventPage({ params }) {
  const { slug } = params;
  const titleIssuing = await getTitleIssuingData(slug);

  if (!titleIssuing) {
    notFound();
  }

  // Get related events
  const relatedEvents = await getRelatedTitleIssuing(titleIssuing.id);

  const statusBadge = getStatusBadge(titleIssuing.status);

  // Generate structured data
  const eventStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/title-issuing/${slug}#event`,
    "name": titleIssuing.title,
    "description": titleIssuing.description,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/title-issuing/${slug}`,
    "startDate": titleIssuing.issueDate || titleIssuing.createdAt,
    "location": {
      "@type": "Place",
      "name": titleIssuing.location,
      "address": titleIssuing.location
    },
    "organizer": {
      "@type": "Organization",
      "name": "Winsper Lands",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"
    },
    ...(titleIssuing.images?.[0] && {
      "image": createImageSrc(titleIssuing.images[0].base64Data, titleIssuing.images[0].mimeType)
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
        "item": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Title Issuing",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/title-issuing`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": titleIssuing.title,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/title-issuing/${slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

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
            href="/title-issuing"
            className="hover:text-foreground shrink-0"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <span itemProp="name">Title Issuing</span>
            <meta itemProp="position" content="2" />
          </a>
          <ChevronRight className="h-4 min-w-4 shrink-0" />
          
          {/* This is the one that will truncate */}
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
              {titleIssuing.title}
            </span>
            <meta itemProp="position" content="4" />
          </span>
        </nav>

        {/* Hero Section */}
        <div className="mb-12 bg-white h-[68vh] relative flex flex-col items-center justify-center overflow-hidden rounded-3xl ">
          <Image
            src={createImageSrc(titleIssuing.images[0].base64Data, titleIssuing.images[0].mimeType)} 
            alt={titleIssuing.title} 
            width={1500} 
            height={700}
            className='absolute h-full object-cover'
          />
          <div className='absolute w-full h-full bg-black/50 '></div>
          <div className="text-center relative z-10 mb-8 absolute -mt-12 mx-4">
            <MotionWrapper
              effect="slideIn" 
              direction="up" 
              delay={0.2}
              className="relative z-[4]"
            >
              <h1 className="text-3xl sm:text-[43px] flex flex-col items-center font-bold mb-4 mt-6 text-white">
                <span className="text-primary">{titleIssuing.title}</span>
                <MotionWrapper 
                  effect="slideIn" 
                  direction="up" 
                  delay={0.4} 
                  duration={0.8}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-[10deg] -mt-2.5 -ml-8" viewBox="0 0 200 30" width="150" height="30">
                    <path d="M10 25 Q140 2 190 25" 
                      stroke="rgb(220 38 38)" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      fill="none"/>
                  </svg>
                </MotionWrapper>
              </h1>
            </MotionWrapper>
            <MotionWrapper
              effect="slideIn" 
              direction="right" 
              delay={0.2}
              className="relative z-[4]"
            >
              <p className="text-sm sm:text-base text-muted-foreground text-white font-sembold max-w-3xl mx-auto">
                {titleIssuing.description}
              </p>
            </MotionWrapper>
          </div>

          {/* Event Details */}
          <MotionWrapper
            effect="slideIn" 
            direction="up" 
            delay={0.2}
            className="relative z-[4] !absolute bottom-4 w-full"
          >
            <div className="max-w-4xl w-full z-10">
              <Card className="rounded-3xl mx-4 border-none bg-transparent shadow-lg">
                <CardContent className="p-8">
                  <div className="grid  gap-8">
                    <div className="space-y-6">
                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <Badge className={`${statusBadge.color} text-sm px-4 py-2 rounded-full`}>
                          {statusBadge.label}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="bg-white/30 rounded-full">
                            <Share2 className="h-5 w-5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="bg-white/30 rounded-full">
                            <Heart className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MotionWrapper>
        </div>

        {/* Gallery Section */}
        {titleIssuing.images && titleIssuing.images.length > 0 && (
          <TitleIssuingGallery images={titleIssuing.images} eventTitle={titleIssuing.title} />
        )}

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Recent Title Issuing Events</h2>
              <p className="text-muted-foreground">Explore our latest completed projects and success stories</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedEvents.map((event) => {
                const eventImage = event.images?.[0];
                const eventImageSrc = eventImage ? createImageSrc(eventImage.base64Data, eventImage.mimeType) : null;
                const eventStatusBadge = getStatusBadge(event.status);
                
                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-3xl group">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {eventImageSrc ? (
                        <img 
                          src={eventImageSrc} 
                          alt={eventImage.alt || event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className={`${eventStatusBadge.color} rounded-full`}>
                          {eventStatusBadge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        {event.clientName && (
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{event.clientName}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.issueDate && (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{new Date(event.issueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <Button variant="outline" className="w-full rounded-full" asChild>
                        <a href={`/title-issuing/${event.id}`}>View Event</a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}