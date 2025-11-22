"use client";

import { LoginForm } from "@/components/login-form";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import React from "react";

export default function Page() {
  const [selectedIndex, setSelectedIndex] = useState(2);

  // Mock week data for UI preview
  const mockWeeks = [
    { label: "Week 1", startDate: "Jan 1", endDate: "Jan 7" },
    { label: "Week 2", startDate: "Jan 8", endDate: "Jan 14" },
    { label: "Week 3", startDate: "Jan 15", endDate: "Jan 21" },
    { label: "Week 4", startDate: "Jan 22", endDate: "Jan 28" },
    { label: "Week 5", startDate: "Jan 29", endDate: "Feb 4" },
  ];

  return (
    <div className="flex flex-col min-h-svh w-full items-center justify-center p-6 md:p-10 gap-8 page-gradient">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
      
      <div className="flex flex-col gap-9 page-gradient rounded-[15px]">
        <div className="flex items-center bg-[#E1E6ED] rounded-[15px] border-4 border-[#F5F7FA]">
          <div className="flex justify-between w-[170px] py-[30px] pl-[30px]">
            <span className="text-[#252525] text-[15px] font-semibold leading-[110%] tracking-[-0.3px] whitespace-nowrap">
              Select a Week
            </span>
            <ChevronLeft 
              className="text-[#252525] cursor-pointer"
              size={20}
            />
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              {mockWeeks.map((w, idx) => {
                const isSelected = idx === selectedIndex;

                const wrapBase = "flex flex-col w-full gap-2.5 pt-[15px] pb-2.5 pr-2.5 pl-[15px] rounded-[8px]";
                const wrapClass = isSelected
                  ? `${wrapBase} bg-[#308BF9] cursor-pointer`
                  : `${wrapBase} bg-transparent cursor-pointer`;

                const titleClass = isSelected
                  ? "text-white text-[12px] font-semibold leading-[110%] tracking-[-0.48px] whitespace-nowrap"
                  : "text-[#252525] text-[12px] font-semibold leading-[110%] tracking-[-0.48px] whitespace-nowrap";

                const dateClass = isSelected
                  ? "text-white text-[10px] font-normal leading-[110%] tracking-[-0.2px] whitespace-nowrap"
                  : "text-[#252525] text-[10px] font-normal leading-[110%] tracking-[-0.2px] whitespace-nowrap";

                return (
                  <React.Fragment key={idx}>
                    <div
                      className={wrapClass}
                      onClick={() => setSelectedIndex(idx)}
                    >
                      <span className={titleClass}>{w.label}</span>
                      <span className={dateClass}>
                        {w.startDate} - {w.endDate}
                      </span>
                    </div>
                    {idx !== mockWeeks.length - 1 && (
                      <div className="border-white border-r h-8 mx-2"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <ChevronRight 
              className="ml-2 text-[#252525] cursor-pointer"
              size={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
