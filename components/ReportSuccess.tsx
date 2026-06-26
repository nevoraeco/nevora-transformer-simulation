"use client";

import React from 'react';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SuccessProps {
  id: string;
  url: string;
}

/**
 * Report Generation Success View
 * The final user touchpoint, featuring soft entrance animations, semantic success tokens,
 * and an external handoff link wrapped in the enterprise Button primitive.
 */
export default function ReportSuccess({ id, url }: SuccessProps) {
  return (
    // Centers the success card and applies a soft scaling entrance animation
    <div className="mx-auto mt-12 w-full max-w-md px-4 sm:px-0 md:mt-24 animate-in zoom-in-95 duration-500 fade-in">
      
      {/* The emerald top border signals success without overwhelming the card background */}
      <Card className="overflow-hidden border-t-[4px] border-t-emerald shadow-lg transition-all duration-300">
        <CardContent className="flex flex-col items-center px-8 pb-8 pt-10 text-center">
          
          {/* Animated Success Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10 text-emerald shadow-inner">
            <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
          </div>
          
          {/* Typography Hierarchy */}
          <h2 className="mb-3 font-heading text-2xl font-bold tracking-tight text-foreground">
            Proposal Generated
          </h2>
          
          <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
            The dynamic infrastructure prospectus for the RWA has been compiled and synced successfully.
          </p>
          
          {/* Simulation ID Badge */}
          <div className="mb-8 flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Simulation Session ID
            </span>
            <span className="font-mono text-sm font-semibold text-foreground tracking-wider select-all">
              {id}
            </span>
          </div>
          
          {/* Action Button: Uses Radix Slot (asChild) to pass styles to the anchor tag */}
          <Button 
            asChild 
            size="lg" 
            className="group w-full gap-2 font-heading tracking-wide shadow-emerald/20 transition-all hover:shadow-lg"
          >
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer noopener"
              aria-label="Open Google Doc Report in a new tab"
            >
              Open Google Doc Report
              <ExternalLink 
                size={16} 
                className="transition-transform duration-300 group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" 
              />
            </a>
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}