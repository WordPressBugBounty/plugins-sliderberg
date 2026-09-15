/**
 * WordPress dependencies
 */
import React from "react";
import { TabPanel } from "@wordpress/components";

/**
 * Internal dependencies
 */
import { TabsPanelControlProps } from "./types";

/**
 * Tabs panel control component
 * Simple wrapper around WordPress TabPanel component
 */
const TabsPanelControl: React.FC<TabsPanelControlProps> = ({ tabs }) => {
  return (
    <TabPanel className="sliderberg-tab-panels" tabs={tabs}>
      {(tab) => tab.component}
    </TabPanel>
  );
};

export default TabsPanelControl;
