// app/title-issuing/page.js
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TitleIssuingFilters from "@/components/TitleIssuingFilters";
import { PrismaClient } from '@prisma/client';


export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Fallback data in case database query fails
const fallbackTitleIssuingEvents = [];

// Server-side data fetching with Prisma
async function getTitleIssuingEvents() {
  try {
    // Query database directly using Prisma
    const titleIssuingEvents = await prisma.titleIssuing.findMany({
      where: {
        isActive: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        images: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          },
          select: {
            id: true,
            base64Data: true,
            mimeType: true,
            filename: true,
            alt: true,
            caption: true,
            order: true,
            fileSize: true,
            width: true,
            height: true
          }
        }
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ]
    });

    if (titleIssuingEvents.length === 0) {
      console.log('No active title issuing events found, using fallback data');
      return fallbackTitleIssuingEvents;
    }

    // Transform the database data to match the expected format
    const transformedData = titleIssuingEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      clientName: event.clientName,
      projectName: event.projectName,
      location: event.location,
      status: event.status,
      issueDate: event.issueDate,
      author: {
        id: event.author.id,
        name: event.author.name,
        email: event.author.email
      },
      images: event.images.map(img => ({
        id: img.id,
        base64Data: img.base64Data,
        mimeType: img.mimeType,
        filename: img.filename,
        alt: img.alt,
        caption: img.caption,
        order: img.order,
        fileSize: img.fileSize,
        width: img.width,
        height: img.height
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    }));

    return transformedData;
  } catch (error) {
    console.error('Database query failed:', error);
    return fallbackTitleIssuingEvents;
  } finally {
    // Disconnect Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Generate metadata dynamically
export async function generateMetadata() {
  try {
    // Get count of title issuing events for dynamic description
    const eventCount = await prisma.titleIssuing.count({
      where: {
        isActive: true
      }
    });

    // Get recent completed events for keywords
    const recentEvents = await prisma.titleIssuing.findMany({
      where: {
        isActive: true,
        status: 'COMPLETED'
      },
      select: {
        title: true,
        location: true,
        clientName: true
      },
      orderBy: {
        issueDate: 'desc'
      },
      take: 3
    });

    await prisma.$disconnect();

    const baseTitle = "Title Issuing Services";
    const metaTitle = `${baseTitle} - Winsper Lands`;
    const metaDescription = eventCount > 0 
      ? `Professional title issuing and verification services. View our portfolio of ${eventCount} successful title processing projects across Kenya.`
      : "Professional title issuing and verification services. Expert handling of property title documentation and legal processing.";

    // Generate keywords from recent events
    const dynamicKeywords = recentEvents.flatMap(event => [
      event.location,
      event.clientName
    ]).filter(Boolean);

    const staticKeywords = [
      'title issuing',
      'property title verification',
      'land title processing',
      'Kenya title services',
      'property documentation',
      'title transfer',
      'real estate legal services',
      'property title search',
      'land registration',
      'title deed processing'
    ];

    const allKeywords = [...staticKeywords, ...dynamicKeywords].slice(0, 20);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: allKeywords,
      authors: [{ name: 'Winsper Lands' }],
      creator: 'Winsper Lands',
      publisher: 'Winsper Lands',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/title-issuing`,
        title: metaTitle,
        description: metaDescription,
        siteName: 'Winsper Lands',
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/og-title-issuing.jpg`,
            width: 1200,
            height: 630,
            alt: 'Title Issuing Services - Winsper Lands',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        creator: '@winsperlands',
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/og-title-issuing.jpg`],
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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/title-issuing`,
      },
      category: 'Legal Services',
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: "Title Issuing Services - Winsper Lands",
      description: "Professional title issuing and verification services. Expert handling of property title documentation and legal processing.",
      keywords: [
        'title issuing',
        'property title verification',
        'land title processing',
        'Kenya title services',
        'property documentation'
      ],
    };
  }
}

const TitleIssuingPage = async () => {
  // Fetch title issuing events data server-side
  const titleIssuingEvents = await getTitleIssuingEvents();

  // Get unique status options for filtering
  const statusOptions = [...new Set(titleIssuingEvents.map(event => event.status))];

  // Get statistics for structured data
  const totalEvents = titleIssuingEvents.length;
  const completedEvents = titleIssuingEvents.filter(event => event.status === 'COMPLETED').length;
  const inProgressEvents = titleIssuingEvents.filter(event => event.status === 'IN_PROGRESS').length;

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Title Issuing Services",
    "description": "Professional property title issuing, verification, and processing services",
    "provider": {
      "@type": "Organization",
      "name": "Winsper Investments",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"
    },
    "serviceType": "Legal Services",
    "areaServed": {
      "@type": "Country",
      "name": "Kenya"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Title Processing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Property Title Verification",
            "description": "Complete verification of property titles and documentation"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Title Transfer Processing",
            "description": "Professional handling of property title transfers"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Land Registration Services",
            "description": "Complete land registration and documentation services"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": completedEvents.toString(),
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // Generate breadcrumb structured data
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
        "name": "Title Issuing Services",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/title-issuing`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/30 bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />

      <Header />
      
      {/* Page Header Section */}
      {/* <section className="relative py-16 bg-gradient-to-r from-blue-900/90 to-teal-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Title Issuing Services
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Professional property title issuing, verification, and processing services. 
              Track our portfolio of successful title documentation projects.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{totalEvents}</div>
                <div className="text-gray-200">Total Projects</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{completedEvents}</div>
                <div className="text-gray-200">Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{inProgressEvents}</div>
                <div className="text-gray-200">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Title Issuing Filters - This will be a client component */}
      <TitleIssuingFilters 
        initialEvents={titleIssuingEvents} 
        statusOptions={statusOptions} 
      />
      
      <Footer />
    </div>
  );
};

export default TitleIssuingPage;