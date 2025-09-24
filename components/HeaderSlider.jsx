'use client'
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Stock High-Quality Wires and Chargers for Your Store!",
      offer: "Limited Time Wholesale Offer",
      buttonText1: "Shop Now",
      buttonText2: "Explore More",
      imgSrc: assets.header_headphone_image, // keep same
    },
    {
      id: 2,
      title: "Upgrade Your Accessories Inventory with Earbuds & Headsets!",
      offer: "Bulk Deals Available",
      buttonText1: "Order Now",
      buttonText2: "View Collection",
      imgSrc: assets.header_playstation_image, // keep same
    },
    {
      id: 3,
      title: "Get Essential Office & Gaming Accessories in Bulk Today!",
      offer: "Exclusive Wholesale Discounts",
      buttonText1: "Buy in Bulk",
      buttonText2: "Learn More",
      imgSrc: assets.header_macbook_image, // keep same
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-8 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-[#54B1CE] pb-1 font-medium">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold text-gray-800">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6 gap-4">
                <button className="md:px-10 px-7 md:py-2.5 py-2 bg-[#54B1CE] rounded-full text-white font-medium">
                  {slide.buttonText1}
                </button>
                <button className="group flex items-center gap-2 px-6 py-2.5 font-medium text-[#54B1CE] border border-[#54B1CE] rounded-full">
                  {slide.buttonText2}
                  <Image
                    className="group-hover:translate-x-1 transition"
                    src={assets.arrow_icon}
                    alt="arrow_icon"
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <Image
                className="md:w-72 w-48"
                src={slide.imgSrc}
                alt={`Slide ${index + 1}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer ${
              currentSlide === index ? "bg-[#54B1CE]" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;
