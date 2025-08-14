import Header from "@/components/Header";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";
import PropertyFilters from "@/components/PropertyFilters";
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Fallback data in case database query fails
const fallbackProperties = [];

// Server-side data fetching with Prisma
async function getProperties() {
  try {
    // Query database directly using Prisma
    const properties = await prisma.landForSale.findMany({
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
          isFeatured: 'desc' // Featured properties first
        },
        {
          createdAt: 'desc'
        }
      ]
    });

    if (properties.length === 0) {
      console.log('No active properties found, using fallback data');
      return fallbackProperties;
    }

    // Transform the database data to match the expected format
    const transformedData = properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: parseFloat(property.price),
      pricePerSqft: property.pricePerSqft ? parseFloat(property.pricePerSqft) : null,
      currency: property.currency,
      location: property.location,
      address: property.address,
      size: property.size,
      sizeInSqft: property.sizeInSqft,
      propertyType: property.propertyType,
      zoning: property.zoning,
      features: property.features,
      amenities: property.amenities,
      latitude: property.latitude,
      longitude: property.longitude,
      status: property.status,
      isFeatured: property.isFeatured,
      slug: property.slug,
      metaTitle: property.metaTitle,
      metaDescription: property.metaDescription,
      author: {
        id: property.author.id,
        name: property.author.name,
        email: property.author.email
      },
      images: property.images.map(img => ({
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
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    }));

    return transformedData;
  } catch (error) {
    console.error('Database query failed:', error);
    return fallbackProperties;
  } finally {
    // Disconnect Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Generate metadata dynamically
export async function generateMetadata() {
  try {
    // Get property statistics for dynamic content
    const [totalProperties, featuredCount, avgPrice, propertyTypes, locations] = await Promise.all([
      // Total active properties
      prisma.landForSale.count({
        where: { isActive: true }
      }),
      
      // Featured properties count
      prisma.landForSale.count({
        where: { isActive: true, isFeatured: true }
      }),
      
      // Average price
      prisma.landForSale.aggregate({
        where: { isActive: true },
        _avg: { price: true }
      }),
      
      // Unique property types
      prisma.landForSale.findMany({
        where: { isActive: true },
        select: { propertyType: true },
        distinct: ['propertyType']
      }),
      
      // Popular locations
      prisma.landForSale.findMany({
        where: { isActive: true },
        select: { location: true },
        distinct: ['location'],
        take: 10
      })
    ]);

    await prisma.$disconnect();

    const baseTitle = "Properties for Sale";
    const metaTitle = totalProperties > 0 
      ? `${totalProperties} Properties for Sale - Winsper Lands`
      : `${baseTitle} - Winsper Lands`;
    
    const avgPriceFormatted = avgPrice._avg?.price 
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(avgPrice._avg.price)
      : '';
    
    const metaDescription = totalProperties > 0
      ? `Discover ${totalProperties} premium properties for sale in Kenya. ${featuredCount} featured listings available. ${avgPriceFormatted ? `Starting from ${avgPriceFormatted}.` : ''} Find your perfect investment opportunity today.`
      : "Discover premium properties for sale in Kenya. Find residential, commercial, and agricultural land with competitive prices and prime locations.";

    // Generate keywords from actual data
    const typeKeywords = propertyTypes.map(type => type.propertyType?.toLowerCase()).filter(Boolean);
    const locationKeywords = locations.map(loc => loc.location?.toLowerCase()).filter(Boolean);
    
    const staticKeywords = [
      'properties for sale Kenya',
      'land for sale Nairobi',
      'real estate Kenya',
      'property investment',
      'buy property Kenya',
      'residential land',
      'commercial property',
      'agricultural land',
      'property listings',
      'real estate investment'
    ];

    const allKeywords = [...staticKeywords, ...typeKeywords, ...locationKeywords].slice(0, 25);

    // Price range for rich snippets
    const priceRange = avgPrice._avg?.price 
      ? `$${Math.round(avgPrice._avg.price * 0.5)}-$${Math.round(avgPrice._avg.price * 2)}`
      : '$50,000-$2,000,000';

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
      other: {
        'property:price_range': priceRange,
        'property:location': 'Kenya',
        'property:type': typeKeywords.join(', '),
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/properties`,
        title: metaTitle,
        description: metaDescription,
        siteName: 'Winsper Lands',
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/og-properties.jpg`,
            width: 1200,
            height: 630,
            alt: 'Properties for Sale - Winsper Lands',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        creator: '@winsperlands',
        images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/og-properties.jpg`],
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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/properties`,
      },
      category: 'Real Estate',
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: "Properties for Sale - Winsper Lands",
      description: "Discover premium properties for sale in Kenya. Find residential, commercial, and agricultural land with competitive prices and prime locations.",
      keywords: [
        'properties for sale Kenya',
        'land for sale Nairobi',
        'real estate Kenya',
        'property investment',
        'buy property Kenya'
      ],
    };
  }
}

const RealEstate = async () => {
  // Fetch properties data server-side
  const properties = await getProperties();

  // Get unique property types and locations for filtering
  const propertyTypes = [...new Set(properties.map(p => p.propertyType).filter(Boolean))];
  const locations = [...new Set(properties.map(p => p.location).filter(Boolean))];
  const statusOptions = [...new Set(properties.map(p => p.status).filter(Boolean))];

  // Calculate statistics
  const totalProperties = properties.length;
  const featuredProperties = properties.filter(p => p.isFeatured).length;
  const availableProperties = properties.filter(p => p.status === 'AVAILABLE').length;
  const avgPrice = properties.length > 0 
    ? properties.reduce((sum, p) => sum + (p.price || 0), 0) / properties.length
    : 0;

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Winsper Investments",
    "description": "Premium real estate and property investment services in Kenya",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/properties`,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KE",
      "addressLocality": "Nairobi"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Kenya"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Property Listings",
      "numberOfItems": totalProperties.toString(),
      "itemListElement": properties.slice(0, 5).map((property, index) => ({
        "@type": "Offer",
        "position": index + 1,
        "itemOffered": {
          "@type": "RealEstateListing",
          "name": property.title,
          "description": property.description,
          "price": property.price,
          "priceCurrency": property.currency || "KES",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": property.location,
            "addressCountry": "KE"
          },
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": property.sizeInSqft,
            "unitText": "sqft"
          }
        }
      }))
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": totalProperties.toString(),
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
        "name": "Properties",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/properties`
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
      {/* <section className="relative py-16 bg-gradient-to-r from-green-900/90 to-teal-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Premium Properties for Sale
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Discover {totalProperties} exclusive properties across Kenya. 
              From residential to commercial and agricultural land - find your perfect investment opportunity.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{totalProperties}</div>
                <div className="text-gray-200">Total Properties</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{featuredProperties}</div>
                <div className="text-gray-200">Featured</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{availableProperties}</div>
                <div className="text-gray-200">Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {avgPrice > 0 ? `$${Math.round(avgPrice / 1000)}k` : 'N/A'}
                </div>
                <div className="text-gray-200">Avg. Price</div>
              </div>
            </div>
          </div>
        </div>
      </section> */}
      
      {/* Property Filters - This will be a client component */}
      <PropertyFilters 
        properties={properties} 
        propertyTypes={propertyTypes}
        locations={locations}
        statusOptions={statusOptions}
      />
      
      <Footer />
    </div>
  );
};

export default RealEstate;