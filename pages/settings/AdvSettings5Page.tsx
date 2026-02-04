
import React from 'react';
import { WifiAdvancedPanel } from './AdvSettings24Page';

export const AdvSettings5Page: React.FC = () => {
  // CMD 231 for 5G, is5g=true enables DFS switch and 5G specific options
  return <WifiAdvancedPanel cmd={231} is5g={true} />;
};
