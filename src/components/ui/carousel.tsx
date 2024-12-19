"use client";

import * as React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";

interface CarouselProps {
  children: React.ReactNode;
  onSelect?: (index: number) => void;
}

export function Carousel({ children, onSelect }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
  });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect_ = React.useCallback(() => {
    if (!emblaApi) return;

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());

    if (onSelect) {
      onSelect(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi, onSelect]);

  React.useEffect(() => {
    if (!emblaApi) return;

    onSelect_();
    emblaApi.on("select", onSelect_);
    emblaApi.on("reInit", onSelect_);

    return () => {
      emblaApi.off("select", onSelect_);
      emblaApi.off("reInit", onSelect_);
    };
  }, [emblaApi, onSelect_]);

  return (
    <div className="relative">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-2 bg-white/80 backdrop-blur-sm hover:bg-white shrink-0 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canScrollPrev}
          onClick={scrollPrev}
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">Image précédente</span>
        </Button>

        <div className="overflow-hidden rounded-xl flex-1">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">{children}</div>
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-2 bg-white/80 backdrop-blur-sm hover:bg-white shrink-0 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canScrollNext}
          onClick={scrollNext}
        >
          <ArrowRightIcon className="h-5 w-5" />
          <span className="sr-only">Image suivante</span>
        </Button>
      </div>
    </div>
  );
}

function CarouselItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-w-0 shrink-0 grow-0 basis-full pl-4 first:pl-0">
      {children}
    </div>
  );
}

export { CarouselItem };
