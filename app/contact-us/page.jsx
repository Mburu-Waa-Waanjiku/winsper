// app/contact/page.jsx
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin } from "lucide-react";
import { PrismaClient } from '@prisma/client';
import MotionWrapper from "@/components/MotionWrapper";

export const dynamic = 'force-dynamic';

// Initialize Prisma client
const prisma = new PrismaClient();

// Fallback data in case database query fails
const fallbackContacts = {};

// Fetch contacts data from database
async function getContactsData() {
  try {
    const contacts = await prisma.contacts.findFirst({
      where: {
        isActive: true
      },
      include: {
        emails: {
          where: {
            isActive: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        phones: {
          where: {
            isActive: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        addresses: {
          where: {
            isActive: true
          },
          orderBy: [
            { isPrimary: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        socialLinks: {
          where: {
            isActive: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!contacts) {
      console.log('No active contacts found, using fallback data');
      return fallbackContacts;
    }

    // Transform the database data to match the expected format
    const transformedData = {
      id: contacts.id,
      companyName: contacts.companyName || "Winsper Lands",
      description: contacts.description || "We're here to help and answer any questions you might have about our real estate services and properties.",
      emails: contacts.emails.map(email => ({
        email: email.email,
        label: email.label,
        isPrimary: email.isPrimary
      })),
      phones: contacts.phones.map(phone => ({
        phone: phone.phone,
        label: phone.label,
        isPrimary: phone.isPrimary
      })),
      addresses: contacts.addresses.map(address => ({
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        label: address.label,
        isPrimary: address.isPrimary
      })),
      socialLinks: contacts.socialLinks.map(social => ({
        platform: social.platform,
        url: social.url
      })),
      contactFormTitle: contacts.contactFormTitle || "Request a Call",
      contactFormDescription: contacts.contactFormDescription || "Click the button below to request a call — a short form will appear where you can leave your name, preferred time, and contact number. We'll reach out as soon as possible.",
      metaTitle: contacts.metaTitle || "Contact Winsper Lands - Get in Touch",
      metaDescription: contacts.metaDescription || "Contact Winsper Lands for all your real estate needs. We're here to help with property investments, land purchases, and title issuing services in Kenya."
    };

    return transformedData;
  } catch (error) {
    console.error('Database query failed:', error);
    return fallbackContacts;
  } finally {
    // Disconnect Prisma client to prevent connection leaks
    await prisma.$disconnect();
  }
}

// Enhanced metadata generation with comprehensive SEO
export async function generateMetadata() {
  try {
    const contacts = await prisma.contacts.findFirst({
      where: {
        isActive: true
      },
      select: {
        metaTitle: true,
        metaDescription: true,
        companyName: true,
        description: true,
        emails: {
          where: {
            isActive: true,
            isPrimary: true
          },
          select: {
            email: true
          },
          take: 1
        },
        phones: {
          where: {
            isActive: true,
            isPrimary: true
          },
          select: {
            phone: true
          },
          take: 1
        },
        addresses: {
          where: {
            isActive: true,
            isPrimary: true
          },
          select: {
            street: true,
            city: true,
            state: true,
            country: true
          },
          take: 1
        }
      }
    });

    await prisma.$disconnect();

    const metaTitle = contacts?.metaTitle || `Contact ${contacts?.companyName || 'Winsper Lands'} - Get in Touch`;
    const metaDescription = contacts?.metaDescription || contacts?.description || "Contact Winsper Lands for all your real estate needs. We're here to help with property investments, land purchases, and title issuing services in Kenya.";
    
    // Create structured data for local business
    const primaryEmail = contacts?.emails?.[0]?.email;
    const primaryPhone = contacts?.phones?.[0]?.phone;
    const primaryAddress = contacts?.addresses?.[0];

    return {
      title: metaTitle,
      description: metaDescription,
      keywords: [
        'contact Winsper Lands',
        'real estate contact Kenya',
        'property investment contact',
        'land sales contact',
        'title issuing services',
        'Nairobi real estate contact',
        'Kenya property contact',
        'real estate consultation'
      ],
      authors: [{ name: contacts?.companyName || 'Winsper Investments' }],
      creator: contacts?.companyName || 'Winsper Investments',
      publisher: contacts?.companyName || 'Winsper Investments',
      formatDetection: {
        email: true,
        address: true,
        telephone: true,
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.co.ke'}/contact`,
        title: metaTitle,
        description: metaDescription,
        siteName: contacts?.companyName || 'Winsper Lands',
      },
      twitter: {
        card: 'summary',
        title: metaTitle,
        description: metaDescription,
        creator: '@winsperlands',
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
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://winsperlands.co.ke'}/contact`,
      },
      category: 'Real Estate',
      ...(primaryEmail && { 
        other: {
          'contact:email': primaryEmail
        }
      }),
      ...(primaryPhone && {
        other: {
          'contact:phone_number': primaryPhone
        }
      })
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: "Contact Winsper Lands - Get in Touch",
      description: "Contact Winsper Lands for all your real estate needs. We're here to help with property investments, land purchases, and title issuing services in Kenya.",
      keywords: [
        'contact Winsper Lands',
        'real estate contact Kenya',
        'property investment contact',
        'Nairobi real estate contact'
      ],
    };
  }
}

const ContactPage = async () => {
  const contactData = await getContactsData();

  // Generate JSON-LD structured data for local business
  const primaryAddress = contactData.addresses?.find(addr => addr.isPrimary) || contactData.addresses?.[0];
  const primaryEmail = contactData.emails?.find(email => email.isPrimary)?.email || contactData.emails?.[0]?.email;
  const primaryPhone = contactData.phones?.find(phone => phone.isPrimary)?.phone || contactData.phones?.[0]?.phone;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/#localbusiness`,
    "name": contactData.companyName,
    "description": contactData.description,
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com",
    ...(primaryEmail && { "email": primaryEmail }),
    ...(primaryPhone && { "telephone": primaryPhone }),
    ...(primaryAddress && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": primaryAddress.street,
        "addressLocality": primaryAddress.city,
        "addressRegion": primaryAddress.state,
        "postalCode": primaryAddress.postalCode,
        "addressCountry": primaryAddress.country
      }
    }),
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      ...(primaryEmail && { "email": primaryEmail }),
      ...(primaryPhone && { "telephone": primaryPhone })
    },
    "sameAs": contactData.socialLinks?.map(social => social.url) || [],
    "openingHours": "Mo-Fr 08:00-17:00",
    "priceRange": "$$",
    "areaServed": {
      "@type": "Country",
      "name": "Kenya"
    },
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "-1.286389",
        "longitude": "36.817223"
      },
      "geoRadius": "100000"
    }
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
        "name": "Contact",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || "https://winsperlands.com"}/contact`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/30 to-primary/30 relative overflow-hidden">
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

      {/* Navigation */}
      <Header />

      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute top-32 right-32 w-32 h-32 bg-white/10 rounded-full"></div>
        
        {/* Flowing lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" fill="none">
          <path d="M0 400C300 200 600 600 900 300C1000 250 1100 350 1200 300" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"/>
          <path d="M0 500C200 300 400 700 700 400C900 300 1000 400 1200 350" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none"/>
          <path d="M0 300C400 100 500 500 800 200C950 150 1050 250 1200 200" stroke="rgba(255,255,255,0.06)" strokeWidth="4" fill="none"/>
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <MotionWrapper
            effect="slideIn" 
            direction="up" 
            delay={0.2} 
            duration={0.6}
          >
          <h1 className="text-6xl md:text-7xl flex flex-col justify-center items-center font-bold text-primary mb-6">
            <span>LET'S TALK</span>
            <MotionWrapper
              effect="slideIn" 
              direction="up" 
              delay={0.4} 
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
          </MotionWrapper>
          <MotionWrapper
            effect="slideIn" 
            direction="up" 
            delay={0.4} 
            duration={0.8}
          >
            <p className="text-xl text-secondary/70 max-w-md mx-auto leading-relaxed">
              {contactData.description}
              <br />
              Feel free to reach out — we'd love to hear from you!
            </p>
          </MotionWrapper>
        </div>

        {/* Contact Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column - Contact Methods */}
            <div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You can contact us through several ways.
                <br />
                Choose the one most convenient for you:
              </p>

              <div className="space-y-8">
                {/* Contact Information */}
                {contactData.emails?.map((emailItem, index) => (
                  <div key={`email-${index}`} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="min-w-5 h-5 text-blue-600" />
                      <div className="flex flex-col">
                        <a 
                          href={`mailto:${emailItem.email}`}
                          className="text-2xl break-all font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {emailItem.email}
                        </a>
                        {emailItem.label && (
                          <span className="text-sm text-gray-500">{emailItem.label}</span>
                        )}
                      </div>
                    </div>
                    {contactData.phones?.[index] && (
                      <div className="flex items-center space-x-3">
                        <Phone className="min-w-5 h-5 text-blue-600" />
                        <div className="flex flex-col">
                          <a 
                            href={`tel:${contactData.phones[index].phone.replace(/\s/g, '')}`}
                            className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {contactData.phones[index].phone}
                          </a>
                          {contactData.phones[index].label && (
                            <span className="text-sm text-gray-500">{contactData.phones[index].label}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Call Request */}
              <div className="mt-12">
                <p className="text-gray-600 mb-6">
                  {contactData.contactFormDescription}
                </p>
                <button className="w-full themebg-green mt-0.5 sm:mt-6 text-white px-3 md:px-6 py-3 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center font-medium">
                  {contactData.contactFormTitle || "Request a call"}
                </button>
              </div>
            </div>

            {/* Right Column - Office Locations */}
            <div className="space-y-8">
              {contactData.addresses?.map((address, index) => (
                <div key={`address-${index}`}>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="min-w-5 h-5 text-blue-600 mr-2" />
                    {address.label || `Office ${index + 1}`}:
                  </h3>
                  <div className="text-gray-600 space-y-1 ml-7">
                    <p>{address.street}</p>
                    <p>
                      {address.city}
                      {address.state && `, ${address.state}`}
                      {address.postalCode && ` ${address.postalCode}`}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          {contactData.socialLinks && contactData.socialLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                {contactData.socialLinks.map((social, index) => (
                  <a
                    key={`social-${index}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Services</h4>
                <div className="space-y-2 text-gray-600">
                  <p>Property Investment</p>
                  <p>Land Sales</p>
                  <p>Title Issuing</p>
                  <p>Property Management</p>
                  <p>Real Estate Consultation</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                <div className="space-y-2 text-gray-600">
                  <p>Property Search</p>
                  <p>Investment Guide</p>
                  <p>Market Reports</p>
                  <p>Legal Resources</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                <div className="space-y-2 text-gray-600">
                  <p>About Us</p>
                  <p>Our Team</p>
                  <p>Testimonials</p>
                  <p>Contact</p>
                  <p>News & Updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ContactPage;