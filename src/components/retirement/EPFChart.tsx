import React, { useEffect, useMemo, useRef, useState } from 'react';

interface EPFData {
    age: number;
    totalAmount: number;
    totalContribution: number;
    dividendEarned: number;
}

interface EPFChartProps {
    data: EPFData[];
}

const EPFChart: React.FC<EPFChartProps> = ({ data }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState<number>(320);
    const chartHeight = 280;

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const resize = () => setWidth(el.clientWidth);
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Sample data more aggressively for many data points
    const sampledData = useMemo(() => {
        if (!data?.length) return [];
        // For long projections, sample every 5 years
        const step = data.length > 30 ? 5 : data.length > 15 ? 3 : 2;
        return data.filter((_, i) => i % step === 0 || i === data.length - 1);
    }, [data]);

    const maxAmount = useMemo(
        () => (sampledData.length ? Math.max(...sampledData.map(d => d.totalAmount)) : 0),
        [sampledData]
    );

    const margin = {
        top: 32,
        right: width < 640 ? 24 : 36,
        bottom: width < 640 ? 56 : 72,
        left: width < 640 ? 72 : 110
    };
    const innerWidth = Math.max(0, width - margin.left - margin.right);
    const innerHeight = chartHeight;

    const xForIndex = (i: number) =>
        margin.left + (innerWidth * i) / Math.max(1, sampledData.length - 1);

    const yForValue = (v: number) =>
        margin.top + innerHeight - (innerHeight * v) / Math.max(1, maxAmount);

    const yGrid = [0, 0.25, 0.5, 0.75, 1];

    const linePath = useMemo(() => {
        if (!sampledData.length) return '';
        return sampledData
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xForIndex(i)},${yForValue(d.totalAmount)}`)
            .join(' ');
    }, [sampledData, innerWidth, innerHeight, maxAmount]);

    const areaPath = useMemo(() => {
        if (!sampledData.length) return '';
        const start = `M ${margin.left} ${margin.top + innerHeight}`;
        const line = sampledData
            .map((d, i) => `L ${xForIndex(i)} ${yForValue(d.totalAmount)}`)
            .join(' ');
        const end = `L ${margin.left + innerWidth} ${margin.top + innerHeight} Z`;
        return `${start} ${line} ${end}`;
    }, [sampledData, innerWidth, innerHeight, maxAmount]);

    const milestoneIdx = useMemo(() => {
        if (!sampledData.length) return -1;
        return sampledData.findIndex(d => d.totalAmount >= 1_000_000);
    }, [sampledData]);

    // Find retirement age (60) index for marking
    const retirementIdx = useMemo(() => {
        return sampledData.findIndex(d => d.age === 60);
    }, [sampledData]);

    return (
        <div className="w-full" ref={containerRef}>
            <div className="relative bg-gradient-to-t from-blue-50 to-white rounded-lg p-4 overflow-hidden">
                <svg width={width} height={chartHeight + margin.top + margin.bottom}>
                    {yGrid.map((ratio, i) => {
                        const y = margin.top + innerHeight * (1 - ratio);
                        const labelVal = maxAmount * ratio;
                        return (
                            <g key={i}>
                                <line
                                    x1={margin.left}
                                    y1={y}
                                    x2={margin.left + innerWidth}
                                    y2={y}
                                    stroke="#d1d5db"
                                    strokeWidth={1}
                                    strokeDasharray="4,4"
                                />
                                <text
                                    x={margin.left - 12}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize="12"
                                    fill="#4b5563"
                                >
                                    RM{(labelVal / 1_000_000).toFixed(1)}M
                                </text>
                            </g>
                        );
                    })}

                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.06" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#areaGradient)" />
                    <path d={linePath} stroke="#10b981" strokeWidth={3} fill="none" />

                    {milestoneIdx >= 0 && (
                        <>
                            <line
                                x1={xForIndex(milestoneIdx)}
                                y1={margin.top}
                                x2={xForIndex(milestoneIdx)}
                                y2={margin.top + innerHeight}
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="6,6"
                            />
                            <text
                                x={xForIndex(milestoneIdx)}
                                y={margin.top - 6}
                                textAnchor="middle"
                                fontSize="12"
                                fontWeight={700}
                                fill="#b45309"
                            >
                                RM1M
                            </text>
                        </>
                    )}

                    {/* Retirement age marker */}
                    {retirementIdx >= 0 && (
                        <>
                            <line
                                x1={xForIndex(retirementIdx)}
                                y1={margin.top}
                                x2={xForIndex(retirementIdx)}
                                y2={margin.top + innerHeight}
                                stroke="#6366f1"
                                strokeWidth={2}
                                strokeDasharray="4,4"
                            />
                            <text
                                x={xForIndex(retirementIdx)}
                                y={margin.top - 8}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight={600}
                                fill="#4f46e5"
                            >
                                Retire (60)
                            </text>
                        </>
                    )}

                    {sampledData.map((d, i) => {
                        const cx = xForIndex(i);
                        const cy = yForValue(d.totalAmount);
                        // Show age labels with proper spacing
                        const showX = i === 0 || i === sampledData.length - 1 || (sampledData.length <= 10 ? true : i % 2 === 0);
                        return (
                            <g key={d.age}>
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={4}
                                    fill="#10b981"
                                    className="hover:r-6 transition-all cursor-pointer"
                                />
                                {showX && (
                                    <text
                                        x={cx}
                                        y={margin.top + innerHeight + 20}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fill="#4b5563"
                                    >
                                        {d.age}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    <text
                        x={margin.left + innerWidth / 2}
                        y={margin.top + innerHeight + 44}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight={600}
                        fill="#374151"
                    >
                        Age (Years)
                    </text>

                    <text
                        x={width < 640 ? 10 : 14}
                        y={margin.top + innerHeight / 2}
                        textAnchor="middle"
                        fontSize={width < 640 ? "12" : "14"}
                        fontWeight={600}
                        fill="#374151"
                        transform={`rotate(-90, ${width < 640 ? 10 : 14}, ${margin.top + innerHeight / 2})`}
                    >
                        {width < 640 ? "EPF (RM M)" : "EPF Amount (RM Millions)"}
                    </text>
                </svg>
            </div>

            <div className="flex flex-wrap justify-center items-center mt-4 gap-3 sm:gap-5">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded" />
                    <span className="text-xs text-muted-foreground">Total EPF</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[3px] bg-amber-500" />
                    <span className="text-xs text-muted-foreground">RM1M Milestone</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[3px] bg-indigo-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #6366f1 0, #6366f1 4px, transparent 4px, transparent 8px)' }} />
                    <span className="text-xs text-muted-foreground">Retirement (60)</span>
                </div>
            </div>
        </div>
    );
};

export default EPFChart;
