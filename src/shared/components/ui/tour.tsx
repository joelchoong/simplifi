import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { ChevronRight, X, Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface TourStep {
    target: string; // CSS selector
    title: string;
    content: string;
    placement: "top" | "bottom" | "left" | "right";
}

interface TourProps {
    steps: TourStep[];
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

export function Tour({ steps, isOpen, onComplete, onSkip }: TourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const currentStepData = steps[currentStep];

    useEffect(() => {
        if (!isOpen) return;

        // Auto-scroll the target element into view when the step changes
        const el = document.querySelector(currentStepData.target);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        const updatePosition = () => {
            const currentEl = document.querySelector(currentStepData.target);
            if (currentEl) {
                setTargetRect(currentEl.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        // Initial delay to ensure elements are rendered
        const timeout = setTimeout(updatePosition, 100);

        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
            clearTimeout(timeout);
        };
    }, [isOpen, currentStep, currentStepData]);

    if (!isOpen || steps.length === 0) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const getPopoverStyle = (): React.CSSProperties => {
        if (!targetRect || windowSize.width === 0) {
            return {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0,
            };
        }

        const padding = 16;
        const popoverWidth = Math.min(320, windowSize.width - 32);

        let top = 0;
        let left = 0;
        let transform = "";

        let placement = currentStepData.placement;

        // Auto-adjust placement for mobile (screen width < 640px)
        if (windowSize.width < 640) {
            // Default to bottom unless target is too close to the bottom edge
            if (targetRect.bottom + 200 > windowSize.height) {
                placement = "top";
            } else {
                placement = "bottom";
            }
        }

        switch (placement) {
            case "top":
                top = targetRect.top - padding;
                left = targetRect.left + (targetRect.width / 2);
                transform = "translate(-50%, -100%)";
                break;
            case "bottom":
                top = targetRect.bottom + padding;
                left = targetRect.left + (targetRect.width / 2);
                transform = "translate(-50%, 0)";
                break;
            case "left":
                top = targetRect.top + (targetRect.height / 2);
                left = targetRect.left - padding;
                transform = "translate(-100%, -50%)";
                break;
            case "right":
                top = targetRect.top + (targetRect.height / 2);
                left = targetRect.right + padding;
                transform = "translate(0, -50%)";
                break;
            default:
                top = windowSize.height / 2;
                left = windowSize.width / 2;
                transform = "translate(-50%, -50%)";
        }

        // Horizontal overflow protection
        if (placement === "top" || placement === "bottom") {
            const halfWidth = popoverWidth / 2;
            if (left - halfWidth < padding) {
                left = padding + halfWidth; // Push right
            } else if (left + halfWidth > windowSize.width - padding) {
                left = windowSize.width - padding - halfWidth; // Push left
            }
        }

        // Vertical overflow protection (basic fallback)
        if (placement === "left" || placement === "right") {
            const popoverHeightEst = 150; // estimated max height
            const halfHeight = popoverHeightEst / 2;
            if (top - halfHeight < padding) top = padding + halfHeight;
            if (top + halfHeight > windowSize.height - padding) top = windowSize.height - padding - halfHeight;
        }

        return { top, left, transform };
    };

    const getClipPath = () => {
        if (!targetRect) return "none";
        const padding = 8;
        const { top, left, right, bottom } = targetRect;
        return `polygon(
      0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
      ${left - padding}px ${top - padding}px,
      ${right + padding}px ${top - padding}px,
      ${right + padding}px ${bottom + padding}px,
      ${left - padding}px ${bottom + padding}px,
      ${left - padding}px ${top - padding}px
    )`;
    };

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop with cutout */}
            <div
                className="absolute inset-0 bg-black/60 transition-all duration-300 pointer-events-auto"
                style={{ clipPath: getClipPath() }}
                onClick={onSkip}
            />

            {/* Popover */}
            <div
                className={cn(
                    "absolute bg-background border border-border shadow-xl rounded-xl p-5 w-80 max-w-[calc(100vw-32px)] pointer-events-auto transition-all duration-300 z-[101]",
                    !targetRect && "opacity-0 scale-95" // Hide briefly if target not found yet
                )}
                style={getPopoverStyle()}
            >
                <button
                    onClick={onSkip}
                    className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 pr-6">
                    <h3 className="font-bold text-lg text-foreground mb-1">{currentStepData.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentStepData.content}</p>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="text-xs font-medium text-muted-foreground">
                        Step {currentStep + 1} of {steps.length}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={onSkip} className="h-8 px-3 text-xs">
                            Skip
                        </Button>
                        <Button size="sm" onClick={handleNext} className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground">
                            {currentStep === steps.length - 1 ? (
                                <>Finish <Check className="ml-1.5 h-3.5 w-3.5" /></>
                            ) : (
                                <>Next <ChevronRight className="ml-1.5 h-3.5 w-3.5" /></>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
