"use client"

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import PropertyGrid from "@/components/PropertyGrid";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import Image from "next/image";
import MotionWrapper from "./MotionWrapper";

const PropertyFilters = ({ properties, propertyTypes }) => {
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter properties based on active category
  const filteredProperties = useMemo(() => {
    if (activeCategory === "all") {
      return properties;
    }
    return properties.filter(property => property.type === activeCategory);
  }, [properties, activeCategory]);

  return (
    <>
      {/* Properties Banner */}
      <MotionWrapper
        effect="fadeIn" 
        delay={0.4} 
        duration={0.8}
      >
        <section className="p-4">
          <Card className="bg-gradient-to-br w-full relative max-h-[50vh] aspect-[2/1] flex justify-center overflow-hidden from-primary/50 via-secondary/50 to-primary/50 rounded-2xl text-white group cursor-pointer">
            <div className="absolute w-full h-full z-10 bg-black/20"></div>
            <Image
              src="/winsper-invest-with-us.png"
              width={1500}
              height={790}
              alt=""
              className="min-h-full min-w-full absolute"
            />
            <div className=" absolute z-10 hidden sm:flex bottom-4 w-full justify-center">
              <button className="bg-white/30 backdrop-blur-md border text-white px-6 pt-1.5 pb-2.5 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Invest With Us Today
              </button>
            </div>
          </Card>
        </section>
      </MotionWrapper>
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 my-4 px-4">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
          className="rounded-full"
        >
          All Properties
        </Button>
        {propertyTypes.map((type) => (
          <Button
            key={type}
            variant={activeCategory === type ? "default" : "outline"}
            onClick={() => setActiveCategory(type)}
            className="rounded-full"
          >
            {type}
          </Button>
        ))}
      </div>
      
      {/* Properties Grid */}
      <PropertyGrid properties={filteredProperties} />
    </>
  );
};

export default PropertyFilters;