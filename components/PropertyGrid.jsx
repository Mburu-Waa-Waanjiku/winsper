import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, Dot } from "lucide-react";
import Link from "next/link";
import MotionWrapper from "./MotionWrapper";

const PropertyGrid = ({ properties }) => {
  //console.log(properties);
  
  const createImageSrc = (base64Data, mimeType) => {
    if (!base64Data || !mimeType) return null; 
    if (base64Data.startsWith('data:')) return base64Data;
    return `data:${mimeType};base64,${base64Data}`;
  };

  return (
    <section className="py-16 bg-white/20 backdrop-blur-md mx-3 mb-4 border border-[1px] border-gray-200 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const imageSrc = property.images && property.images[0] 
              ? createImageSrc(property.images[0].base64Data, property.images[0].mimeType)
              : null;

            return (
              <Link key={property.id} href={`${property.slug}`} className="block no-underline">
                <MotionWrapper
                  effect="slideIn" 
                  direction="up"
                  delay={0.2} 
                  duration={0.8}
                >
                  <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow h-full cursor-pointer">
                    <div className="relative">
                      <img
                        src={imageSrc || '/placeholder-image.jpg'}
                        alt={property.title}
                        className="w-full h-48 object-cover"
                      />
                      {property.status === "SOLD" && 
                        <Badge 
                          className="absolute top-3 left-3 !text-white bg-primary text-primary-foreground"
                          variant="default"
                        >
                          {property.status}
                        </Badge>
                      }
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4 mt-0.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          <span>{property.area}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-2 overflow-hidden text-ellipsis">
                        {property.title}
                      </h3>
                      <div className="text-2xl flex items-center font-bold text-primary mb-4">
                        KSH {property.price}
                        <Dot className="h-8 text-gray-400 -mb-3 w-8"/>
                        <span className="text-gray-400 text-[22px] font-[500] ">{property.location}</span>
                      </div>
                    </div>
                  </div>
                </MotionWrapper>
              </Link>
            );
          })}
        </div>
        
        <div className="text-center mt-8">
          <button className="text-primary hover:underline font-medium">
            Load more
          </button>
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;