import { createContext, useContext } from "react";

interface SliderContextType {
  currentSlideId: string | null;
  isCarouselMode: boolean;
  slidesToShow: number;
}

export const SliderContext = createContext<SliderContextType>({
  currentSlideId: null,
  isCarouselMode: false,
  slidesToShow: 1,
});

export const useSliderContext = () => useContext(SliderContext);
