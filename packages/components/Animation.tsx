import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

interface AnimationProps {
  animationData: object;
  height?: string; // Optional size prop (e.g., '50px', '100px', '10%')
  width?: string; // Optional size prop (e.g., '50px', '100px', '10%')
  alignLeft?: boolean; // Optional alignLeft prop
}

const Animation: React.FC<AnimationProps> = ({ animationData, height = '100%', width = '100%', alignLeft = false }) => {
  const animationContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animationContainer.current) {
      lottie.loadAnimation({
        container: animationContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      });
    }
  }, [animationData]);

  return (
    <div
      ref={animationContainer}
      className={`flex items-center justify-center ${alignLeft ? '' : 'mx-auto'}`}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

export default Animation;