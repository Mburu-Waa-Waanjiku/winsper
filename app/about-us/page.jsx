import Link from "next/link";
import { Building, Users, Award, Shield, Phone, Mail, VideoIcon, MessageCircle, DollarSign, MapPin, Search } from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import Footer from "@/components/Footer";
import { PrismaClient } from '@prisma/client';
import MotionWrapper from  "@/components/MotionWrapper"
import { IoLogoWhatsapp } from "react-icons/io5";

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Fallback data in case database query fails
const fallbackData = {
  about: {
    id: "about_fallback",
    title: "About Winsper Lands",
    description: "Your trusted partner in real estate investment",
    sections: [],
    metaTitle: "About Us - Winsper Lands",
    metaDescription: "Learn about Winsper Lands, your trusted partner in real estate investment. We help Kenyans from all walks of life acquire land and achieve their property ownership dreams."
  },
  featuredProperties: [],
  propertyTypes: [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "agricultural", label: "Agricultural" }
  ],
  priceRanges: [
    { value: "0-50000", label: "KSh 0 - 50,000" },
    { value: "50000-100000", label: "KSh 50,000 - 100,000" },
    { value: "100000-200000", label: "KSh 100,000 - 200,000" },
    { value: "200000-500000", label: "KSh 200,000 - 500,000" },
    { value: "500000-1000000", label: "KSh 500,000 - 1,000,000" },
    { value: "1000000+", label: "KSh 1,000,000+" }
  ],
  areas: [
    { value: "westlands", label: "Westlands" },
    { value: "karen", label: "Karen" },
    { value: "kilimani", label: "Kilimani" },
    { value: "lavington", label: "Lavington" },
    { value: "kileleshwa", label: "Kileleshwa" },
    { value: "runda", label: "Runda" },
    { value: "muthaiga", label: "Muthaiga" },
    { value: "gigiri", label: "Gigiri" },
    { value: "spring-valley", label: "Spring Valley" },
    { value: "riverside", label: "Riverside" },
    { value: "parklands", label: "Parklands" },
    { value: "south-c", label: "South C" },
    { value: "south-b", label: "South B" },
    { value: "langata", label: "Langata" },
    { value: "upperhill", label: "Upperhill" }
  ]
};

// Default section data for fallback
const defaultSections = [];

// Server-side data fetching function
async function getAboutPageData() {
  try {
    // Fetch about page data and featured properties
    const [about, featuredProperties] = await Promise.all([
      prisma.about.findFirst({
        where: {
          isActive: true
        },
        include: {
          sections: {
            where: {
              isActive: true
            },
            orderBy: {
              order: 'asc'
            }
          }
        }
      }),

      // Fetch featured properties (land listings)
      prisma.landForSale.findMany({
        where: {
          status: 'AVAILABLE',
          isActive: true,
          //isFeatured: true
        },
        include: {
          images: {
            where: {
              isActive: true
            },
            orderBy: {
              order: 'asc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 3
      })
    ]);

    // Transform the data
    const transformedData = {
      about: about ? {
        id: about.id,
        title: about.title || "About Winsper Lands",
        description: about.description || "Your trusted partner in real estate investment",
        sections: about.sections.map(section => ({
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
        metaTitle: about.metaTitle || "About Us - Winsper Lands",
        metaDescription: about.metaDescription || "Learn about Winsper Lands, your trusted partner in real estate investment. We help Kenyans from all walks of life acquire land and achieve their property ownership dreams."
      } : null,
      featuredProperties: featuredProperties.map(property => ({
        id: property.id,
        title: property.title,
        location: property.location,
        price: property.price.toString(),
        currency: property.currency,
        status: property.status,
        slug: property.slug,
        image: property.images[0] ? {
          base64Data: property.images[0].base64Data,
          mimeType: property.images[0].mimeType,
          alt: property.images[0].alt || property.title
        } : null
      })),
      ...fallbackData
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
export async function generateMetadata() {
  try {
    const about = await prisma.about.findFirst({
      where: {
        isActive: true
      },
      select: {
        metaTitle: true,
        metaDescription: true,
        title: true,
        description: true,
        sections: {
          where: {
            isActive: true,
            imageBase64: {
              not: null
            }
          },
          orderBy: {
            order: 'asc'
          },
          take: 1,
          select: {
            imageBase64: true,
            imageMimeType: true,
            imageAlt: true,
            imageWidth: true,
            imageHeight: true,
            title: true
          }
        }
      }
    });

    await prisma.$disconnect();

    const metaTitle = about?.metaTitle || about?.title || "About Us - Winsper Lands | Your Trusted Real Estate Partner";
    const metaDescription = about?.metaDescription || about?.description || "Learn about Winsper Lands, your trusted partner in real estate investment. We help Kenyans from all walks of life acquire land and achieve their property ownership dreams.";
    
    // Create Open Graph image from first section image if available
    let ogImage = null;
    if (about?.sections?.[0]) {
      const firstSection = about.sections[0];
      ogImage = {
        url: `data:${firstSection.imageMimeType};base64,${firstSection.imageBase64}`,
        width: firstSection.imageWidth || 1200,
        height: firstSection.imageHeight || 630,
        alt: firstSection.imageAlt || firstSection.title || metaTitle,
      };
    }

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        'about Winsper Lands',
        'real estate company Kenya',
        'property investment Nairobi',
        'land ownership Kenya',
        'title deed services',
        'flexible payment land',
        'affordable real estate Kenya',
        'real estate investment partner',
        'land for sale Kenya',
        'property development Kenya'
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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/about`,
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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.com'}/about`,
      },
      category: 'Real Estate',
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: "About Us - Winsper Lands | Your Trusted Real Estate Partner",
      description: "Learn about Winsper Lands, your trusted partner in real estate investment. We help Kenyans from all walks of life acquire land and achieve their property ownership dreams.",
      keywords: [
        'about Winsper Lands',
        'real estate company Kenya',
        'property investment Nairobi',
        'land ownership Kenya'
      ],
    };
  }
}

const whyChooseUsIcons = [Building, Users, Shield, Award];

const AboutPage = async () => {
  const aboutData = await getAboutPageData();
  const { about, featuredProperties, propertyTypes, priceRanges, areas } = aboutData;
  
  // Use database sections or fallback to default
  const sections = about?.sections?.length > 0 ? about.sections : defaultSections;

  // Ensure we have at least 7 sections (pad with defaults if needed)
  const paddedSections = [...sections];
  // while (paddedSections.length < 7) {
  //   const defaultIndex = paddedSections.length;
  //   paddedSections.push(defaultSections[defaultIndex] || defaultSections[0]);
  // }

  // Sort sections by order
  const sortedSections = paddedSections.sort((a, b) => a.order - b.order);

  // Helper function to create image src from base64
  function createImageSrc(base64Data, mimeType) {
    if (!base64Data || !mimeType) return null;
    if (base64Data.startsWith('data:')) return base64Data;
    return `data:${mimeType};base64,${base64Data}`;
  }

  // Generate JSON-LD structured data for SEO
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Winsper Investments",
    "description": about?.description || "Your trusted partner in real estate investment in Kenya",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "KE",
      "addressLocality": "Nairobi"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Kenya"
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": -1.286389,
        "longitude": 36.817223
      }
    }
  };

  const aboutPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": about?.title || "About Winsper Investments",
    "description": about?.description || "Learn about our company and services",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.co.ke"}/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Winsper Investments"
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutPageStructuredData),
        }}
      />

      {/* Navigation */}
      <Header/>

      {/* Hero Section - Uses section[0] */}
      <section className="relative z-[1] px-8 sm:px-16 pt-16 bg-gradient-to-r from-background to-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <MotionWrapper
              effect="slideIn" 
              direction="up" 
              delay={0.2}
              className="relative z-[4]"
            >
              <h1 className="text-5xl md:text-6xl flex flex-col justify-center items-center font-bold text-secondary mb-6">
                {sortedSections[0]?.title || "Find Real Estate That Suits You"}
                <MotionWrapper
                  effect="slideIn" 
                  direction="up" 
                  delay={0.4} 
                  duration={0.8}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-rotate-[10deg] -mt-2.5 -ml-24" viewBox="0 0 200 30" width="200" height="30">
                    <path d="M10 25 Q8 2 190 25" 
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
              direction="up" 
              delay={0.4}
              className="relative z-[4]"
            >
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {sortedSections[0]?.content || "We as Winsper Lands Investments are determined to walk with customers every step of the way until we see you reach your goals of investing in property and having your own title deed."}
              </p>
            </MotionWrapper>
            <button className="themebg-green text-white px-6 py-2 rounded-lg">
              Start Your Journey
            </button>
            {/* Stats Section */}
            <div className="max-w-6xl mx-auto mt-16 mb-4 grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">9K+</div>
                <div className="text-gray-600">Premium Product</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">2K+</div>
                <div className="text-gray-600">Happy Customer</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">3S+</div>
                <div className="text-gray-600">Awards Winning</div>
              </div>
            </div>
          </div>
          <MotionWrapper
            effect="slideIn"  
            directio="left"
            delay={0.4}
            className="relative z-[4]"
          >
            <div className="relative h-full min-h-[400px] w-full">
              {sortedSections[0]?.imageBase64 ? (
                <Image
                  src={`data:${sortedSections[0].imageMimeType};base64,${sortedSections[0].imageBase64}`}
                  alt={sortedSections[0].imageAlt || "Hero image"}
                  fill
                  className="w-full h-auto rounded-tl-[80px] shadow-2xl object-cover"
                />
              ) : (
                <Image
                  src="/202405260901img3.png" 
                  alt="Modern building" 
                  fill
                  className="w-full h-auto rounded-tl-[80px] shadow-2xl"
                />
              )}
            </div>
          </MotionWrapper>
        </div>
      </section>

      {/* Search Section */}
      <SearchForm mockHomepageData={{ propertyTypes, priceRanges, areas }} />

      {/* Why Choose Us Section - Uses sections[1] to sections[4] */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-secondary mb-12">
            WHY CHOOSE US?
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            {sortedSections.slice(1, 5).map((section, index) => {
              const IconComponent = whyChooseUsIcons[index] || Building;
              return (
                <MotionWrapper
                  effect="slideIn" 
                  direction="up" 
                  delay={0.4}
                  key={section.id || index}
                  className="relative z-[4]"
                >
                  <div  className="text-center px-6 py-12 bg-white max-w-[450px] m-auto rounded-xl">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {section.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </MotionWrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Residence Section */}
      <section className="px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-secondary">Our Popular Residence</h2>
            <Link href="/land-for-sale">
              <button className="bg-secondary border-primary text-white px-6 py-2 rounded-lg">
                Explore All
              </button>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProperties.length > 0 && (
              featuredProperties.slice(0, 4).map((property) => (
                <MotionWrapper
                  effect="fadeIn"  
                  delay={0.4}
                  key={property.id}
                  className="relative z-[4]"
                >
                  <Link  href={`/land-for-sale/${property.slug}`}>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow">
                      <div className="h-48 relative bg-gray-200">
                        {property.image ? (
                          <Image
                            src={`data:${property.image.mimeType};base64,${property.image.base64Data}`}
                            alt={property.image.alt || property.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Building className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">📍 {property.location}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <button className="themebg-green mr-2 text-white px-4 py-1 rounded-lg text-sm">
                              {property.status === 'AVAILABLE' ? 'For Sale' : property.status}
                            </button>
                            <span className="text-2xl font-bold text-secondary">
                              {property.currency === 'USD' ? '$' : 'KSh'}{property.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </MotionWrapper>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonial Section - Uses section[5] */}
      <section className="px-6 pb-16 bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/50 -mt-32 text-white">
        <div className="max-w-4xl flex-col sm:flex-row flex gap-8 justify-center pt-32 mx-auto text-center">
          <MotionWrapper
            effect="fadeIn"  
            delay={0.4}
            className="relative z-[4]"
          >
            <div className="h-full w-full mt-16 flex flex-col justify-center">
              <div className="font-semibold text-lg whitespace-nowrap">
                {sortedSections[5]?.title?.split(',')[0] || "Grace"}
              </div>
              <div className="text-white/80 whitespace-nowrap">
                {sortedSections[5]?.title?.split(',')[1] || "CEO, Winsper Lands"}
              </div>
            </div>
          </MotionWrapper>
          <MotionWrapper
            effect="fadeIn"  
            delay={0.4}
            className="relative z-[4]"
          >
            <p className="text-xl leading-relaxed mb-8">
              <span className="text-6xl text-white/20 mb-4">"</span>
              {sortedSections[5]?.content || "There is something for everyone. Our vision is to make sure that we empower anyone from all walks of life and background to have somewhere they can call their own."}
              <span className="text-6xl text-white/20 mb-4">"</span>
            </p>
          </MotionWrapper>
        </div>
      </section>

      {/* Contact Section - Uses section[6] */}
      <section className="px-6 pt-16 mb-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-xl text-primary mb-6">
              Contact Us
            </h1>
            <h2 className="text-3xl font-bold text-secondary mb-6">
              {sortedSections[6]?.title || "Easy to Contact With Us"}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {sortedSections[6]?.content || "We are just one click away. Are you ready to start planning on owning somewhere you can call yours? Get in touch with us today and start making your dream of having your own land a reality."}
            </p>
            <div className="grid grid-cols-2 mb-6 gap-4">
              <MotionWrapper
                effect="slideIn"  
                directio="up"
                delay={0.4}
                className="relative z-[4]"
              >
                <Link href="tel:0720 108584" className="text-center shadow-xl p-5 bg-primary/10 aspect-square flex flex-col justify-end max-w-44 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                  <Phone className="w-[50px] h-[50px] mb-4 text-primary mx-auto mb-2" />
                  <div className="text-sm text-gray-600">0720 108584</div>
                  <div className="mt-2 w-full bg-primary/30 font-bold rounded-lg py-2">Call</div>
                </Link>
              </MotionWrapper>
              <MotionWrapper
                effect="slideIn"  
                directio="up"
                delay={0.6}
                className="relative z-[4]"
              >
                <Link href="mailto:info@winsperlands.com" className="text-center shadow-xl p-5 bg-primary/10 aspect-square flex flex-col justify-end max-w-44 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                  <Mail className="w-[50px] h-[50px] text-primary mx-auto mb-2" />
                  <div className="text-sm break-all text-gray-600">info@winsperlands.co.ke</div>
                  <div className="mt-2 w-full bg-primary/30 font-bold rounded-lg py-2">Chat Now</div>
                </Link>
              </MotionWrapper>
              <MotionWrapper
                effect="slideIn"  
                directio="up"
                delay={0.8}
                className="relative z-[4]"
              >
                <Link href="https://wa.me/254720108584" target="_blank" rel="noopener noreferrer" className="text-center shadow-xl p-5 bg-primary/10 aspect-square flex flex-col justify-end max-w-44 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                  <IoLogoWhatsapp className="w-[50px] h-[50px] text-primary mx-auto mb-2" />
                  <div className="text-sm text-gray-600">WhatsApp</div>
                  <div className="mt-2 w-full bg-primary/30 font-bold rounded-lg py-2">Chat</div>
                </Link>
              </MotionWrapper>
              <MotionWrapper
                effect="slideIn"  
                directio="up"
                delay={0.4}
                className="relative z-[4]"
              >
                <Link href="tel:0720 108584" className="text-center shadow-xl p-5 bg-primary/10 aspect-square flex flex-col justify-end max-w-44 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                  <MessageCircle className="w-[50px] h-[50px] text-primary mx-auto mb-2" />
                  <div className="text-sm text-gray-600">0720 108584</div>
                  <div className="mt-2 w-full bg-primary/30 font-bold rounded-lg py-2">Message</div>
                </Link>
              </MotionWrapper>
            </div>
          </div>
          <MotionWrapper
            effect="slideIn"  
            direction="right"
            delay={0.4}
            className="relative z-[4]"
          >
            <div className="relative h-full min-h-[400px] w-full">
              {sortedSections[6]?.imageBase64 ? (
                <Image
                  src={`data:${sortedSections[6].imageMimeType};base64,${sortedSections[6].imageBase64}`}
                  alt={sortedSections[6].imageAlt || "Contact image"}
                  fill
                  className="w-full h-auto rounded-tl-[80px] shadow-2xl object-cover"
                />
              ) : (
                <Image
                  src="/202405260901img3.png" 
                  alt="Modern building" 
                  fill  
                  className="w-full h-auto rounded-tl-[80px] shadow-2xl"
                />
              )}
            </div>
          </MotionWrapper>
        </div>
      </section>

      {/* Join Community Section */}
      <section className="px-6 py-24 relative border text-white relative overflow-hidden">
        <Image src="/202405260901img3.png" fill alt="winsper"/>
        <div className="bg-black/20 absolute top-0 left-0 h-full w-full"></div>
        <MotionWrapper
          effect="slideIn" 
          direction="up" 
          delay={0.4}
          className="relative z-[4]"
        >
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
            <button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
              Start Investing
            </button>
          </div>
        </MotionWrapper>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;