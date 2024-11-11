import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Slider = dynamic(() => import('rc-slider'), {
  ssr: false,
});

const DynamicSlider = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Slider {...props} />;
};

export default DynamicSlider;