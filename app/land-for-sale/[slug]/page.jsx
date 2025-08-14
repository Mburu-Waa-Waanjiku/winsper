import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageSlider from '@/components/ImageSlider';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Home, DollarSign, Share2, Heart, ChevronRight, Calendar, Ruler, Tag } from "lucide-react";
import MotionWrapper from '@/components/MotionWrapper';

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Server component to fetch land data
async function getLandData(slug) {
  try {
    const land = await prisma.landForSale.findUnique({
      where: {
        slug: slug,
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

    return land;
  } catch (error) {
    console.error('Error fetching land data:', error);
    return null;
  } finally {
    // Disconnect Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Fetch related properties in the same area
async function getRelatedProperties(currentPropertyId, location, limit = 4) {
  try {
    const relatedProperties = await prisma.landForSale.findMany({
      where: {
        id: { not: currentPropertyId },
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
            not: currentPropertyId,
            notIn: relatedProperties.map(p => p.id)
          },
          isActive: true,
          //status: 'AVAILABLE'
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

// Enhanced metadata generation with comprehensive SEO
export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const land = await prisma.landForSale.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      select: {
        title: true,
        description: true,
        price: true,
        currency: true,
        location: true,
        address: true,
        size: true,
        propertyType: true,
        status: true,
        metaTitle: true,
        metaDescription: true,
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

    if (!land) {
      return {
        title: 'Property Not Found - Winsper Lands',
        description: 'The requested property could not be found.',
      };
    }

    const metaTitle = land.metaTitle || `${land.title} - ${land.location} | Winsper Lands`;
    const metaDescription = land.metaDescription || land.description?.substring(0, 160) || `${land.propertyType} property for sale in ${land.location}. ${formatPrice(land.price, land.currency)} - ${land.size}`;
    
    // Create Open Graph image from property image if available
    let ogImage = null;
    if (land.images?.[0]) {
      const propertyImage = land.images[0];
      ogImage = {
        url: `data:${propertyImage.mimeType};base64,${propertyImage.base64Data}`,
        width: propertyImage.width || 1200,
        height: propertyImage.height || 630,
        alt: propertyImage.alt || land.title,
      };
    }

    const formattedPrice = formatPrice(land.price, land.currency);

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        'property for sale',
        `${land.propertyType} for sale`,
        `land for sale ${land.location}`,
        'Kenya property',
        'real estate investment',
        'Winsper Lands',
        land.location,
        land.propertyType,
        `${land.size} property`,
        'property investment Kenya'
      ],
      authors: [{ name: 'Winsper Lands' }],
      creator: 'Winsper Lands',
      publisher: 'Winsper Lands',
      formatDetection: {
        email: false,
        address: true,
        telephone: false,
      },
      openGraph: {
        type: 'article',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/property/${slug}`,
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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/property/${slug}`,
      },
      category: 'Real Estate',
      other: {
        'property:price:amount': land.price.toString(),
        'property:price:currency': land.currency,
        'property:location': land.location,
        'property:type': land.propertyType,
        'property:status': land.status,
        'property:size': land.size,
      }
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Property Details - Winsper Lands',
      description: 'View property details and invest in prime real estate opportunities with Winsper Lands.',
      keywords: [
        'property for sale',
        'Kenya real estate',
        'land for sale',
        'property investment'
      ],
    };
  }
}

// Format price function
function formatPrice(price, currency = 'KES') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
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

// Helper function to create image src from base64
function createImageSrc(base64Data, mimeType) {
  if (!base64Data || !mimeType) return null;
  if (base64Data.startsWith('data:')) return base64Data;
  return `data:${mimeType};base64,${base64Data}`;
}

export default async function LandProductPage({ params }) {
  const { slug } = params;
  const land = await getLandData(slug);

  if (!land) {
    notFound();
  }

  // Get related properties
  const relatedProperties = await getRelatedProperties(land.id, land.location);

  const statusBadge = getStatusBadge(land.status);
  const pricePerSqft = land.pricePerSqft ? formatPrice(land.pricePerSqft) : null;
  const formattedPrice = formatPrice(land.price, land.currency);

  // Generate structured data for the property
  const propertyStructuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/property/${slug}#property`,
    "name": land.title,
    "description": land.description,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/property/${slug}`,
    "datePosted": land.createdAt,
    "validThrough": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    "listingAgent": {
      "@type": "RealEstateAgent",
      "name": land.author.name || "Winsper Lands Agent",
      "email": land.author.email
    },
    "realEstateListing": {
      "@type": "SingleFamilyResidence", 
      "name": land.title,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": land.location,
        "addressRegion": land.address,
        "addressCountry": "KE"
      },
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": land.sizeInSqft || 0,
        "unitText": "square feet"
      },
      "numberOfRooms": land.features?.length || 0,
      "amenityFeature": land.amenities?.map(amenity => ({
        "@type": "LocationFeatureSpecification",
        "name": amenity
      })) || []
    },
    "offers": {
      "@type": "Offer",
      "price": land.price,
      "priceCurrency": land.currency,
      "availability": land.status === 'AVAILABLE' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "validFrom": land.createdAt
    },
    ...(land.images?.[0] && {
      "image": createImageSrc(land.images[0].base64Data, land.images[0].mimeType)
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
        "name": "Properties",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/properties`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": land.location,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/properties?location=${encodeURIComponent(land.location)}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": land.title,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/property/${slug}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(propertyStructuredData),
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
              href="/land-for-sale"
              className="hover:text-foreground shrink-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name">Properties</span>
              <meta itemProp="position" content="2" />
            </a>
            <ChevronRight className="h-4 min-w-4 shrink-0" />
            
            <a
              href={`/land-for-sale`}
              className="hover:text-foreground shrink-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <span itemProp="name">{land.location}</span>
              <meta itemProp="position" content="3" />
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
                {land.title}
              </span>
              <meta itemProp="position" content="4" />
            </span>
          </nav>

          {/* Animated Header */}
          <MotionWrapper 
            effect="slideIn" 
            direction="up" 
            delay={0.2}
            className="relative z-[4]"
          >
            <h1 className="text-xl lg:text-2xl mb-8 mb-3 font-bold mb-2">{land.title}</h1>
          </MotionWrapper>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Property Images */}
            <MotionWrapper 
              effect="slideIn" 
              direction="up" 
              delay={0.4}
              className="relative z-[4]"
            >
              <div className="lg:col-span-2 h-full">
                {land.images && land.images.length > 0 ? (
                  <ImageSlider images={land.images} />
                ) : (
                  <div className="relative rounded-3xl h-[450px] bg-muted flex items-center justify-center">
                    <Home className="h-16 w-16 text-muted-foreground" />
                    <p className="text-muted-foreground ml-4">No images available</p>
                  </div>
                )}
              </div>
            </MotionWrapper>

            {/* Property Details Card */}
            <MotionWrapper 
              effect="slideIn" 
              direction="up" 
              delay={0.8}
              className="relative z-[4]"
            >
              <div className="lg:col-span-1">
                <Card className="h-fit rounded-3xl sticky top-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <p className="text-sm">{land.location}</p>
                        </div>
                        {land.address && (
                          <p className="text-sm text-muted-foreground">{land.address}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" title="Share Property">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Add to Favorites">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <Badge className={statusBadge.color}>
                        {statusBadge.label}
                      </Badge>
                      {land.isFeatured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:items-center justify-between">
                      <div className="text-3xl font-bold text-primary">
                        <span className='whitespace-nowrap'>KSH {land.price.toString()}</span>
                        {pricePerSqft && (
                          <div className="text-sm font-normal text-muted-foreground">
                            {pricePerSqft} per sq ft
                          </div>
                        )}
                      </div>
                      {land.propertyType && (
                        <Button variant="outline" className="flex items-center !text-sm rounded-full px-4 border-gray-300 gap-1" size="sm">
                          {land.propertyType}
                          <ChevronRight className="w-1.5 h-1.5 mt-1"/>
                        </Button>
                      )}
                    </div>

                    {/* Additional Details */}
                    {land.zoning && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Zoning</div>
                        <div className="font-medium">{land.zoning}</div>
                      </div>
                    )}

                    {/* Features */}
                    {land.features && land.features.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {land.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size */}
                    {land.size && (
                      <div>
                        <h3 className="font-semibold mb-2">Size</h3>
                        <div className="flex flex-wrap font-semibold gap-2">
                          {land.size} 
                        </div>
                      </div>
                    )}

                    {/* CTA & AGENT */}
                    <div className='grid gap-4 '>
                      {/* Author/Agent */}
                      <div className="w-full h-fit rounded-3xl bg-secondary/5 px-6 py-3 ">
                        {/* <div className=" hidden lg:flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage 
                                src={"/Winsper-Lands-Investments-Limited-logo.png"} 
                                alt={`Agent`}
                              />
                            </Avatar>
                          </div>
                          <div className="text-sm text-muted-foreground">Customer Care</div>
                        </div> */}

                        <div className="flex justify-between items-center !mt-2 items-end">
                          <Avatar className="rounded-none">
                            <AvatarImage 
                              src={"/Winsper-Lands-Investments-Limited-logo.png"} 
                              alt={`Agent`}
                            />
                          </Avatar>
                          <Button variant="outline" className="px-10 rounded-full border-gray-400">
                            Contact Us
                          </Button>
                        </div>
                      </div>

                      {/* Contact CTA */}
                      <div className="bg-muted bg-primary text-white hover:bg-primary/90 rounded-3xl p-4">
                        <div className="w-full text-2xl pb-1 leading-5 font-semibold text-center">
                          Request a tour
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </MotionWrapper>
          </div>

          {/* Property Description */}
          <MotionWrapper 
            effect="slideIn" 
            direction="up" 
            delay={0.6}
            className="relative z-[4]"
          >
            <div className="mt-12">
              <Card className="rounded-3xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">About this property</h2>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {land.description}
                    </p>
                  </div>

                  {/* Amenities */}
                  {land.amenities && land.amenities.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {land.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-sm">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Property Details */}
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {land.latitude && land.longitude && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Coordinates</div>
                        <div className="font-medium">
                          {land.latitude.toFixed(6)}, {land.longitude.toFixed(6)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </MotionWrapper>
        </div>
      </main>

      {/* Related Properties */}
      <div className="bg-white p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Similar properties in {land.location}</h3>
            <Button variant="outline" className="flex border-2 items-center rounded-full px-6 border-gray-300 gap-1" size="sm">
              View All
              <ChevronRight className="w-2 h-2 mt-1"/>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProperties.map((property) => {
              const propertyImage = property.images?.[0];
              const propertyImageSrc = propertyImage ? createImageSrc(propertyImage.base64Data, propertyImage.mimeType) : null;
              
              return (
                <MotionWrapper 
                  effect="slideIn" 
                  direction="left" 
                  delay={0.8}
                  className="relative z-[4]"
                  key={property.id}
                >
                  <Card  className="overflow-hidden hover:shadow-lg transition-shadow">
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
                          <span className="font-bold">{formatPrice(property.price, property.currency)}</span>
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

      {/* Footer */}
      <Footer />
    </div>
  );
}