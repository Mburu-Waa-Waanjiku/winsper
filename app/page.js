import { Search, Home, Users, Mail, MapPin, DollarSign, Building, User, ChevronLeft, ChevronRight, Badge, Heart } from 'lucide-react';
import Image from 'next/image';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeSearch from '@/components/HomeSearch';
import HeroSlideshow from '@/components/HeroSlideshow';
import MotionWrapper from '@/components/MotionWrapper';
import { PrismaClient } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Fallback data in case database query fails
const fallbackData = {
  id: "homepage_fallback",
  heroTitle: "Winsper Lands",
  heroSubtitle: "Investments",
  heroDescription: "Your Real & True Partner.",
  heroCtaText: "Search Properties",
  heroCtaUrl: "/search",
  heroImages: [],
  sections: [
    {
      id: "section_1",
      title: "Find Community",
      content: "Discover the essential services you need when moving into your new home. From furniture stores to babysitters and insurance agents, find everything you need to settle in comfortably.",
      imageAlt: "People having a discussion in a home setting",
      order: 0,
    },
    {
      id: "section_2", 
      title: "Professional Services",
      content: "Connect with trusted professionals including real estate agents, home inspectors, and contractors to help you with your property needs.",
      imageAlt: "Family reviewing documents together",
      order: 1,
    },
    {
      id: "section_3",
      title: "Home & Living", 
      content: "Everything you need to make your house a home. Furniture, appliances, home décor, and local services to create your perfect living space.",
      imageAlt: "Couple relaxing in a modern living room",
      order: 2,
    },
    {
      id: "section_4",
      title: "Family Services",
      content: "Find childcare, education, healthcare, and family-friendly activities in your new neighborhood to help your family settle in.",
      imageAlt: "Parent and child enjoying time together", 
      order: 3,
    }
  ],
  metaTitle: "Winsper Lands - Find Your Perfect Property",
  metaDescription: "Discover properties and connect with your new community. Find everything you need to make your house a home.",
};

async function getHomepageData() {
  try {
    // Query database directly using Prisma
    const homepage = await prisma.homepage.findFirst({
      where: {
        isActive: true
      },
      include: {
        heroImages: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        sections: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!homepage) {
      console.log('No active homepage found, using fallback data');
      return fallbackData;
    }

    // Transform the database data to match the expected format
    const transformedData = {
      id: homepage.id,
      heroTitle: homepage.heroTitle || "Winsper Lands",
      heroSubtitle: homepage.heroSubtitle || "Investments", 
      heroDescription: homepage.heroDescription || "Your Real & True Partner.",
      heroCtaText: homepage.heroCta || "Search Properties",
      heroCtaUrl: homepage.heroCtaLink || "/search",
      heroImages: homepage.heroImages.map(img => ({
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
      sections: homepage.sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content,
        imageBase64: section.imageBase64,
        imageMimeType: section.imageMimeType,
        imageFilename: section.imageFilename,
        imageAlt: section.imageAlt,
        imageWidth: section.imageWidth,
        imageHeight: section.imageHeight,
        imageSize: section.imageSize,
        order: section.order
      })),
      metaTitle: homepage.metaTitle || "Winsper Lands - Find Your Perfect Property",
      metaDescription: homepage.metaDescription || "Discover properties and connect with your new community. Find everything you need to make your house a home."
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

async function getHomepageProperties(limit = 4) {
  try {
    const relatedProperties = await prisma.landForSale.findMany({
      where: {
        //id: { not: currentPropertyId },
        isFeatured: true,
        isActive: true,
        status: 'AVAILABLE'
      },
      include: {
        images: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          take: 1
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // If we don't have enough related properties by location, get recent ones
    if (relatedProperties.length < limit) {
      const additionalProperties = await prisma.landForSale.findMany({
        where: {
          id: { 
            //not: currentPropertyId,
            notIn: relatedProperties.map(p => p.id)
          },
          isActive: true,
          status: 'AVAILABLE'
        },
        include: {
          images: {
            where: { isActive: true },
            orderBy: { order: 'asc' },
            take: 1
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit - relatedProperties.length
      });

      return [...relatedProperties, ...additionalProperties];
    }

    return relatedProperties;
  } catch (error) {
    console.error('Error fetching related properties:', error);
    return [];
  }
}

const relatedProperties = await getHomepageProperties();

// Helper function to create image src from base64
function createImageSrc(base64Data, mimeType) {
  if (!base64Data || !mimeType) return null;
  if (base64Data.startsWith('data:')) return base64Data;
  return `data:${mimeType};base64,${base64Data}`;
}

// Format status badge
function getStatusBadge(status) {
  const statusConfig = {
    AVAILABLE: { label: 'Available', variant: 'default', color: 'bg-green-100 text-green-800' },
    UNDER_CONTRACT: { label: 'Under Contract', variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
    SOLD: { label: 'Sold', variant: 'destructive', color: 'bg-red-100 text-red-800' },
    WITHDRAWN: { label: 'Withdrawn', variant: 'outline', color: 'bg-gray-100 text-gray-800' },
  };
  
  return statusConfig[status] || statusConfig.AVAILABLE;
}

// Enhanced metadata generation with comprehensive SEO
export async function generateMetadata() {
  try {
    const homepage = await prisma.homepage.findFirst({
      where: {
        isActive: true
      },
      select: {
        metaTitle: true,
        metaDescription: true,
        heroTitle: true,
        heroSubtitle: true,
        heroDescription: true,
        heroImages: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          },
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

    const metaTitle = homepage?.metaTitle || `${homepage?.heroTitle || 'Winsper Lands'} - ${homepage?.heroSubtitle || 'Investments'}`;
    const metaDescription = homepage?.metaDescription || homepage?.heroDescription || "Discover properties and connect with your new community. Find everything you need to make your house a home.";
    
    // Create Open Graph image from hero image if available
    let ogImage = null;
    if (homepage?.heroImages?.[0]) {
      const heroImage = homepage.heroImages[0];
      ogImage = {
        url: `data:${heroImage.mimeType};base64,${heroImage.base64Data}`,
        width: heroImage.width || 1200,
        height: heroImage.height || 630,
        alt: heroImage.alt || metaTitle,
      };
    }

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        'real estate',
        'property investment',
        'land for sale',
        'Kenya property',
        'Nairobi real estate',
        'Winsper Lands',
        'property search',
        'residential property',
        'commercial property',
        'agricultural land'
      ],
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
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com',
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
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
        yahoo: process.env.YAHOO_SITE_VERIFICATION,
      },
      alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com',
      },
      category: 'Real Estate',
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: "Winsper Lands - Find Your Perfect Property",
      description: "Discover properties and connect with your new community. Find everything you need to make your house a home.",
      keywords: [
        'real estate',
        'property investment',
        'land for sale',
        'Kenya property',
        'Nairobi real estate',
        'Winsper Lands'
      ],
    };
  }
}

export default async function RootlyHomepage() {
  const homepageData = await getHomepageData();
  
  // Ensure sections are sorted by order (already sorted in query, but just to be safe)
  const sortedSections = homepageData.sections?.sort((a, b) => a.order - b.order) || [];
  
  // Sort hero images by order (already sorted in query, but just to be safe)
  const sortedHeroImages = homepageData.heroImages?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Winsper Lands",
    "description": homepageData.heroDescription,
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke",
    "logo": sortedHeroImages[0] ? `data:${sortedHeroImages[0].mimeType};base64,${sortedHeroImages[0].base64Data}` : undefined,
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/#organization`,
    "sameAs": [
      // Add your social media URLs here
      // "https://www.facebook.com/winsperlands",
      // "https://twitter.com/winsperlands",
      // "https://www.linkedin.com/company/winsperlands"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KE",
      "addressLocality": "Nairobi"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service"
    },
    "founder": {
      "@type": "Organization",
      "name": "Winsper Lands"
    }
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Winsper Lands",
    "description": homepageData.metaDescription,
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.e",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.coke"}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
          __html: JSON.stringify(websiteStructuredData),
        }}
      />

      {/* Hero Section */}
      <section className="relative h-[100vh] bg-gradient-to-r from-teal-50 to-blue-50 overflow-hidden">
        {/* Animated Header */}
        <MotionWrapper 
          effect="slideIn" 
          direction="right" 
          delay={0.2}
          className="relative z-[4]"
        >
          <Header color={"text-white"} />
        </MotionWrapper>

        {/* Hero Slideshow Background */}
        <HeroSlideshow 
          images={sortedHeroImages} 
          autoSlide={true} 
          slideInterval={6000}
        />

        <div className="relative z-[3] h-full flex justify-center items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center -mt-[15vh]">
            {/* Animated Hero Title */}
            <MotionWrapper 
              effect="slideIn" 
              direction="up" 
              delay={0.4} 
              duration={0.8}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {homepageData.heroTitle}
                <br />
                <span className="text-primary flex flex-col items-center text-3xl md:text-4xl">
                  {homepageData.heroSubtitle}
                  <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-[10deg] -mt-2 -ml-8" viewBox="0 0 200 30" width="150" height="30">
                    <path d="M10 25 Q100 2 190 25" 
                      stroke="rgb(239 68 68)" 
                      strokeWidth="10" 
                      strokeLinecap="round" 
                      fill="none"/>
                  </svg>
                </span>

              </h1>
            </MotionWrapper>

            {/* Animated Hero Description */}
            <MotionWrapper 
              effect="fadeIn" 
              delay={1.2} 
              duration={0.8}
            >
              <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
                {homepageData.heroDescription}
              </p>
            </MotionWrapper>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className=" bg-gray-50">
        <div className="relative z-[3] h-full flex justify-center items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="text-center">
            {/* Animated Hero Title */}
            <MotionWrapper 
              effect="slideIn" 
              direction="up" 
              delay={0.4} 
              duration={0.8}
            >
              <h3 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-6">
                <span className='text-secondary'>Welcome To </span>
                <span className='text-primary'>Winsper Investments</span>
                <br />
                <span className="text-red-600 flex flex-col items-center text-2xl sm:text-3xl md:text-4xl">
                  Your Home Of Investments
                  <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-[10deg] -mt-2.5 -ml-8" viewBox="0 0 200 30" width="150" height="30">
                    <path d="M10 25 Q140 2 190 25" 
                      stroke="rgb(139 196 53)" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                      fill="none"/>
                  </svg>
                </span>

              </h3>
            </MotionWrapper>

            {/* Animated Hero Description */}
            <MotionWrapper 
              effect="fadeIn" 
              delay={1.2} 
              duration={0.8}
            >
              <p className="text-lg text-secondary mb-12 max-w-2xl mx-auto">
                Your trusted partner in finding the perfect property. We make real estate simple and accessible for everyone.
              </p>
              <Button className="text-white mb-4">
                <Link href="#properties">{`View Top Properties >>`}</Link>
              </Button>
            </MotionWrapper>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-16">
            {sortedSections.map((section, index) => {
              // Helper function to create image src from base64
              const createImageSrc = (base64Data, mimeType) => {
                if (!base64Data || !mimeType) return null;
                if (base64Data.startsWith('data:')) return base64Data;
                return `data:${mimeType};base64,${base64Data}`;
              };

              const imageSrc = createImageSrc(section.imageBase64, section.imageMimeType);
              const isEven = index % 2 === 0;

              // Animated content div
              const contentDiv = (
                <MotionWrapper 
                  effect="slideIn" 
                  direction={isEven ? "up" : "left"} 
                  delay={0.2} 
                  duration={0.8}
                >
                  <div>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-900 mb-6">
                      {section.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      {section.content}
                    </p>
                    <button className="themebg-green text-white px-6 py-2 rounded-lg">
                      Start Investing Today
                    </button>
                  </div>
                </MotionWrapper>
              );
              
              // Animated image div with conditional rounding
              const imageDiv = (
                <MotionWrapper 
                  effect="scaleIn" 
                  delay={0.4} 
                  duration={0.8}
                >
                  <div className="relative h-full min-h-[400px] w-full">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={section.imageAlt || section.title}
                        fill
                        className={`object-cover ${isEven ?  'rounded-tr-[80px] rounded-bl-[80px]' : 'rounded-tl-[80px] rounded-br-[80px]' }`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    ) : (
                      <Image
                        src="/202405260901img3.png"
                        alt="Modern building"
                        fill
                        className={`w-full h-auto shadow-2xl ${isEven ? 'rounded-tl-[80px]' : 'rounded-tr-[80px]'}`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    )}
                  </div>
                </MotionWrapper>
              );

              return (
                <MotionWrapper 
                  key={section.id} 
                  effect="fadeIn" 
                  delay={index * 0.1}
                  className="relative z-[1] px-8 sm:px-8 pt-16 pb-8 bg-gradient-to-r from-background to-gray-50"
                >
                  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    {isEven ? (
                      // Even index: content first, then image
                      <>
                        {contentDiv}
                        {imageDiv}
                      </>
                    ) : (
                      // Odd index: image first, then content
                      <>
                        {imageDiv}
                        {contentDiv}
                      </>
                    )}
                  </div>
                </MotionWrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* Related Properties */}
      <div id="properties" className="bg-white p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
            <h3 className="text-4xl text-center font-semibold">Top Investment Opportunities</h3>
            <Button variant="outline" className="flex mt-8 lg:mt-0 border-2 items-center rounded-full px-6 border-gray-300 gap-1" size="sm">
              {`View All >>`}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProperties.map((property, index) => {
              const propertyImage = property.images?.[0];
              const propertyImageSrc = propertyImage ? createImageSrc(propertyImage.base64Data, propertyImage.mimeType) : null;
              
              return (
                <MotionWrapper 
                  effect="slideIn" 
                  direction="up" 
                  delay={0.2 + index * 0.2}
                >
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative">
                      {propertyImageSrc ? (
                        <img 
                          src={propertyImageSrc} 
                          alt={propertyImage.alt || property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {property.isFeatured && <Badge variant="secondary">Featured</Badge>}
                          <Badge className={getStatusBadge(property.status).color}>
                            {getStatusBadge(property.status).label}
                          </Badge>
                          <Button variant="ghost" size="icon">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-semibold line-clamp-2">{property.title}</h4>
                        <p className="text-sm text-muted-foreground">{property.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">KSH {property.price.toNumber()}</span>
                          <span className="text-sm text-muted-foreground">{property.size}</span>
                        </div>
                        <Button variant="outline" className="w-full mt-2" asChild>
                          <a href={`/land-for-sale/${property.slug}`}>View Details</a>
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

      {/* Animated Footer */}
      <MotionWrapper 
        effect="slideIn" 
        direction="up" 
        delay={0.2}
      >
        <Footer/>
      </MotionWrapper>
    </div>
  );
}