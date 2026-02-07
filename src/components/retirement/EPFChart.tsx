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
    const chartHeight = 320;

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const resize = () => setWidth(el.clientWidth);
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const sampledData = useMemo(() => {
        if (!data?.length) return [];
        return data.filter((_, i) => i % 2 === 0 || i === data.length - 1);
    }, [data]);

    const maxAmount = useMemo(
        () => (sampledData.length ? Math.max(...sampledData.map(d => d.totalAmount)) : 0),
        [sampledData]
    );

    const margin = {
        top: 24,
        right: width < 640 ? 16 : 28,
        bottom: width < 640 ? 48 : 64,
        left: width < 640 ? 60 : 100
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

    return (
        <div className="w-full" ref={containerRef}>
            <div className="relative bg-gradient-to-t from-blue-50 to-white rounded-lg p-4 overflow-x-hidden">
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

                    {sampledData.map((d, i) => {
                        const cx = xForIndex(i);
                        const cy = yForValue(d.totalAmount);
                        const showX = i % 3 === 0;
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
                                        y={margin.top + innerHeight + 28}
                                        textAnchor="middle"
                                        fontSize="12"
                                        fill="#4b5563"
                                    >
                                        Age {d.age}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    <text
                        x={margin.left + innerWidth / 2}
                        y={margin.top + innerHeight + 48}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight={600}
                        fill="#374151"
                    >
                        Ages
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

            <div className="flex flex-col sm:flex-row justify-center items-center mt-4 gap-3 sm:gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-sm text-gray-600">Total EPF Amount</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[4px] bg-yellow-500" />
                    <span className="text-sm text-gray-600">RM1 Million Milestone</span>
                </div>
            </div>
        </div>
    );
};

export default EPFChart;
